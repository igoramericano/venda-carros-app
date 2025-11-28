import streamlit as st
import pandas as pd
import json
import numpy as np
import hashlib
import time
import os
import requests 

# --- CONFIGURAÇÕES E CONSTANTES ---
# VALORES ATUALIZADOS AQUI!
GOOGLE_API_KEY = "AIzaSyCZrLGMUxO1DAj-DPD8QCYD2dCrLb9ZaDE"
GOOGLE_CX_ID = "10fc8141a61b041c1"

FILES = {'users': 'usuarios.csv', 'json': 'veiculos.json', 'vendas': 'vendas.csv', 'uploads': 'uploads'}
COLS_VENDAS = ['ID', 'Tipo', 'Marca', 'Modelo', 'Ano', 'Cor', 'Quilometragem', 'Preco', 'is_featured', 'Caminho_Fotos', 'Preco_Formatado']
MARCAS_POP = ['FIAT', 'VOLKSWAGEN (VW)', 'CHEVROLET (GM)', 'HYUNDAI', 'FORD', 'TOYOTA']

st.set_page_config(layout="wide", page_title="Veículos Online", page_icon="🚗", initial_sidebar_state="expanded")
os.makedirs(FILES['uploads'], exist_ok=True)

# --- CSS GLOBAL (MODO CLARO FORÇADO) ---
ST_STYLE = """
<style>
    [data-testid="stAppViewContainer"] { background-color: #f8f9fa; }
    h1, h2, h3, p, label, .stMarkdown, .stRadio p { color: #2c3e50 !important; }
    input, .stTextInput input, .stNumberInput input, .stSelectbox div[data-baseweb="select"] > div {
        background-color: #ffffff !important; color: #000000 !important; border: 1px solid #ced4da !important;
    }
    [data-testid="stSidebar"] { background-color: #ffffff; border-right: 1px solid #e9ecef; }
    .modern-card, .element-container:has(div[data-testid="stContainer"]) > div:first-child {
        background-color: #ffffff !important; padding: 20px; border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-bottom: 15px;
    }
    div[data-baseweb="popover"], ul[data-testid="stSelectboxVirtualDropdown"] { background-color: #ffffff !important; }
    li[role="option"] { color: #2c3e50 !important; }
    li[role="option"]:hover { background-color: #e9ecef !important; }
</style>
"""

# --- UTILITÁRIOS ---
def hash_pass(p): return hashlib.sha256(p.encode()).hexdigest()
def check_pass(p, h): return hash_pass(p) == h

def buscar_foto_api(termo):
    # Esta função usa as constantes definidas acima para fazer a chamada API
    try:
        res = requests.get("https://www.googleapis.com/customsearch/v1", 
             params={'q': termo, 'cx': GOOGLE_CX_ID, 'key': GOOGLE_API_KEY, 'searchType': 'image', 'num': 1})
        return res.json()['items'][0]['link'] if 'items' in res.json() else None
    except: return None

@st.cache_data(ttl=60)
def get_data(key):
    try:
        if key == 'users': 
            df = pd.read_csv(FILES['users'])
            if 'role' not in df.columns: df['role'] = 'regular'; df.to_csv(FILES['users'], index=False)
            return df
        elif key == 'vendas':
            df = pd.read_csv(FILES['vendas'])
            df['Preco'] = pd.to_numeric(df['Preco'], errors='coerce').fillna(0).astype(int)
            df['Preco_Formatado'] = df['Preco'].apply(lambda x: f"R$ {x:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
            if 'ID' not in df.columns: df['ID'] = range(1, len(df)+1)
            df['Caminho_Fotos'] = df.get('Caminho_Fotos', pd.Series(dtype='str')).astype(str).replace('nan', '')
            return df
        elif key == 'json':
            with open(FILES['json'], 'r', encoding='utf-8') as f: return json.load(f)
    except (FileNotFoundError, pd.errors.EmptyDataError):
        return pd.DataFrame(columns=['email','password','nome','role']) if key == 'users' else pd.DataFrame(columns=COLS_VENDAS) if key == 'vendas' else {}

def save_data(df, key):
    df.to_csv(FILES[key], index=False)
    st.cache_data.clear()

def sort_marcas(lista):
    s = set(lista)
    return [m for m in MARCAS_POP if m in s] + sorted([m for m in s if m not in MARCAS_POP])

# --- COMPONENTES UI ---
def render_auth():
    st.sidebar.title("🚘 Navegação")
    if not st.session_state.get('logged_in'):
        opt = st.sidebar.radio("Acesso:", ["Login", "Cadastro"], horizontal=True)
        df = get_data('users')
        with st.sidebar.form("auth"):
            email = st.text_input("Email")
            pwd = st.text_input("Senha", type="password")
            nome = st.text_input("Nome") if opt == "Cadastro" else ""
            if st.form_submit_button("Confirmar", type="primary"):
                if opt == "Login":
                    user = df[df['email'] == email]
                    if not user.empty and check_pass(pwd, user['password'].iloc[0]):
                        st.session_state.update({'logged_in': True, 'user_name': user['nome'].iloc[0], 'user_role': user['role'].iloc[0]})
                        st.rerun()
                    else: st.error("Dados inválidos")
                else:
                    if not df[df['email'] == email].empty: st.warning("Email já existe")
                    elif email and pwd:
                        role = 'admin' if df.empty else 'regular'
                        new_u = pd.DataFrame({'email': [email], 'password': [hash_pass(pwd)], 'nome': [nome], 'role': [role]})
                        save_data(pd.concat([df, new_u]), 'users')
                        st.success("Criado! Faça login."); time.sleep(1); st.rerun()
    else:
        st.sidebar.success(f"Olá, {st.session_state['user_name']}")
        opts = ["Catálogo"] + (["Admin"] if st.session_state['user_role'] == 'admin' else [])
        st.session_state['menu'] = st.sidebar.radio("Ir para:", opts)
        if st.sidebar.button("Sair"): st.session_state.clear(); st.rerun()

def render_catalogo(df):
    mestre = get_data('json')
    c1, c2, c3 = st.columns([1, 6, 1])
    with c2:
        with st.container():
            st.header("🔍 Busca de Veículos")
            tipos = sorted([t.capitalize() for t in mestre.keys()]) or ['Carros']
            tipo = st.radio("Tipo:", tipos, horizontal=True)
            df_tipo = df[df['Tipo'] == tipo] if not df.empty else df
            
            # Filtros
            termo = st.text_input("Busca:", placeholder="Ex: Civic")
            ca, cb = st.columns(2)
            
            min_p, max_p = (int(df_tipo['Preco'].min()), int(df_tipo['Preco'].max())) if not df_tipo.empty else (0, 100000)
            if min_p >= max_p: max_p = min_p + 1000
            fp = ca.slider("Preço:", min_p, max_p, (min_p, max_p))
            
            min_a, max_a = (int(df_tipo['Ano'].min()), int(df_tipo['Ano'].max())) if not df_tipo.empty else (2015, 2025)
            if min_a >= max_a: max_a = min_a + 1
            fa = cb.slider("Ano:", min_a, max_a, (min_a, max_a))
            
            cc, cd = st.columns(2)
            
            todas_marcas_tipo = [m['marca'] for m in mestre.get(tipo.lower(), [])]
            marcas_src = todas_marcas_tipo
            marca_sel = cc.multiselect("Marca:", sort_marcas(marcas_src))
            
            # Modelos
            mods = []
            origem = marca_sel if marca_sel else todas_marcas_tipo
            for i in mestre.get(tipo.lower(), []):
                if i['marca'] in origem: mods.extend(i['modelos'])
            mod_sel = cd.multiselect("Modelo:", sorted(set(mods)))

    # Lógica de Filtragem
    if not df_tipo.empty:
        mask = (df_tipo['Preco'].between(*fp)) & (df_tipo['Ano'].between(*fa))
        if termo: mask &= df_tipo.apply(lambda x: termo.lower() in str(x.values).lower(), axis=1)
        if marca_sel: mask &= df_tipo['Marca'].isin(marca_sel)
        if mod_sel: mask &= df_tipo['Modelo'].isin(mod_sel)
        df_filt = df_tipo[mask]
    else: df_filt = pd.DataFrame()

    # Cards
    st.markdown("---")
    st.subheader(f"✅ Resultados: {len(df_filt)}")
    
    # Destaques
    dest = df_filt[df_filt['is_featured'] == True]
    if not dest.empty:
        st.info("⭐ Destaques")
        cols = st.columns(3)
        for i, (_, row) in enumerate(dest.iterrows()):
            with cols[i%3]: show_card(row)
        st.markdown("---")

    if not df_filt.empty:
        cols = st.columns(3)
        for i, (_, row) in enumerate(df_filt.iterrows()):
            with cols[i%3]: show_card(row)
    else: st.warning("Sem resultados.")

def show_card(row):
    """Renderiza o card do veículo, tratando o caminho da foto."""
    with st.container(border=True):
        img_src = "https://via.placeholder.com/300x200?text=Sem+Foto"
        
        # Pega o primeiro caminho/URL. Caminho_Fotos é garantido ser string pelo load_vendas_data.
        path = row['Caminho_Fotos'].split(';')[0] if row['Caminho_Fotos'] else ""
        
        # 1. Prioridade: É uma URL da API?
        if path.startswith('http'):
            img_src = path
        # 2. Próxima Prioridade: É um arquivo local existente?
        elif os.path.exists(path): 
            img_src = path
        
        # Se for inválido, img_src permanece o placeholder.
        st.image(img_src, use_container_width=True)
        st.markdown(f"**{row['Marca']} {row['Modelo']}**\n\n💰 {row['Preco_Formatado']}")
        st.caption(f"{row['Ano']} | {row['Cor']} | {row['Quilometragem']}km")
        st.button("Ver Detalhes", key=f"det_{row['ID']}")

def render_admin(df):
    st.title("🛡️ Admin")
    t1, t2 = st.tabs(["Novo", "Estoque"])
    mestre = get_data('json')
    
    with t1:
        st.subheader("Novo")
        c1, c2, c3 = st.columns(3)
        tipo = c1.selectbox("Tipo", ['Carros', 'Motos'])
        marcas = sort_marcas([i['marca'] for i in mestre.get(tipo.lower(), [])])
        marca = c2.selectbox("Marca", marcas)
        mods = sorted([m for i in mestre.get(tipo.lower(), []) if i['marca'] == marca for m in i['modelos']])
        modelo = c3.selectbox("Modelo", mods) if mods else c3.text_input("Modelo")
        cor = st.text_input("Cor", "Branco")
        
        # API Busca
        url_auto = st.session_state.get('url_auto', '')
        c_btn, c_img = st.columns([1, 2])
        if c_btn.button("🔍 Buscar Foto"):
            # CHAMADA DE API UTILIZANDO AS CONSTANTES
            url = buscar_foto_api(f"{marca} {modelo} {cor} {tipo} oficial")
            if url: st.session_state['url_auto'] = url; st.success("Achou!")
            else: st.warning("Não achou.")
        if url_auto: c_img.image(url_auto, width=200)

        with st.form("cad"):
            ca, cb, cc = st.columns(3)
            ano = ca.number_input("Ano", 1900, 2025, 2023)
            val = cb.number_input("Valor", 0, 1000000, 50000)
            km = cc.number_input("KM", 0, value=0)
            dest = st.checkbox("Destaque?")
            url_f = st.text_input("URL Foto", value=url_auto)
            up = st.file_uploader("Upload", type=['jpg','png'])
            
            if st.form_submit_button("Salvar", type="primary"):
                nid = df['ID'].max() + 1 if not df.empty else 1
                path = url_f
                if up:
                    path = os.path.join(FILES['uploads'], f"V{nid}_{up.name}")
                    with open(path, "wb") as f: f.write(up.getbuffer())
                
                novo = {'ID': nid, 'Tipo': tipo, 'Marca': marca, 'Modelo': modelo, 'Ano': ano, 'Cor': cor,
                        'Quilometragem': km, 'Preco': val, 'is_featured': dest, 'Caminho_Fotos': path}
                save_data(pd.concat([df, pd.DataFrame([novo])]), 'vendas')
                st.session_state['url_auto'] = ""; st.success("Salvo!"); time.sleep(1); st.rerun()

    with t2:
        if not df.empty:
            df_ed = st.data_editor(df, hide_index=True, num_rows="fixed", use_container_width=True)
            if st.button("Salvar Alterações"): save_data(df_ed, 'vendas'); st.success("Atualizado!"); st.rerun()

# --- MAIN ---
st.markdown(ST_STYLE, unsafe_allow_html=True)
c_usr, c_tit = st.columns([1, 6])
if st.session_state.get('logged_in'): c_usr.markdown(f"**👋 {st.session_state['user_name']}**")
c_tit.markdown("<h1 style='text-align: center;'>🚗 Veículos Premium</h1>", unsafe_allow_html=True)
st.markdown("---")

render_auth()
df_vendas = get_data('vendas')
if st.session_state.get('menu') == "Admin": render_admin(df_vendas)
else: render_catalogo(df_vendas)