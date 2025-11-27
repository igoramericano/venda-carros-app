import streamlit as st
import pandas as pd
import json
import numpy as np
import hashlib
import time
import os 

# --- Configuração Inicial ---
st.set_page_config(
    layout="wide", 
    page_title="App de Vendas de Carros e Motos",
    page_icon="🚗🏍️"
)

# --- Variáveis de Arquivo ---
USUARIOS_FILE = 'usuarios.csv'
VEICULOS_FILE = 'veiculos.json' # Lista mestra de modelos
VENDAS_FILE = 'vendas.csv' 
UPLOADS_DIR = 'uploads' 
MARCAS_POPULARES = ['FIAT', 'VOLKSWAGEN (VW)', 'CHEVROLET (GM)', 'HYUNDAI', 'FORD', 'TOYOTA'] # Marcas prioritárias

# Garante que a pasta 'uploads' exista
os.makedirs(UPLOADS_DIR, exist_ok=True)


# --- Funções de Utilitário (Login/Cadastro e Load Data) ---

def make_hashes(password):
    return hashlib.sha256(password.encode()).hexdigest()

def check_hashes(password, hashed_text):
    return make_hashes(password) == hashed_text

# Inicializa o estado de sessão para lembrança de campos
if 'login_email' not in st.session_state:
    st.session_state['login_email'] = ""
if 'login_password' not in st.session_state:
    st.session_state['login_password'] = ""
if 'cadastro_email' not in st.session_state:
    st.session_state['cadastro_email'] = ""
if 'cadastro_nome' not in st.session_state:
    st.session_state['cadastro_nome'] = ""
    
# Garante que o estado de login existe
if 'logged_in' not in st.session_state:
    st.session_state['logged_in'] = False
if 'user_name' not in st.session_state:
    st.session_state['user_name'] = ""
if 'user_role' not in st.session_state: 
    st.session_state['user_role'] = "regular"

@st.cache_data(ttl=60) 
def load_user_data():
    """Carrega dados de usuários do CSV."""
    try:
        df_users = pd.read_csv(USUARIOS_FILE)
        if 'role' not in df_users.columns:
             df_users['role'] = 'regular'
             df_users.to_csv(USUARIOS_FILE, index=False)
    except FileNotFoundError:
        df_users = pd.DataFrame(columns=['email', 'password', 'nome', 'role'])
    return df_users

def add_user_data(email, password, nome, role='regular'):
    """Adiciona um novo usuário ao DataFrame e salva no CSV."""
    df_users = load_user_data()
    hashed_password = make_hashes(password)
    new_user = pd.DataFrame({'email': [email], 'password': [hashed_password], 'nome': [nome], 'role': [role]})
    
    df_users = pd.concat([df_users, new_user], ignore_index=True)
    df_users.to_csv(USUARIOS_FILE, index=False)
    st.cache_data.clear()
    return True

@st.cache_data(ttl=60)
def load_vendas_data():
    """Carrega dados dos veículos cadastrados para venda."""
    try:
        df_vendas = pd.read_csv(VENDAS_FILE)
        
    except FileNotFoundError:
        st.warning(f"Arquivo de vendas '{VENDAS_FILE}' não encontrado. Cadastre um veículo.")
        return pd.DataFrame(columns=['ID', 'Tipo', 'Marca', 'Modelo', 'Ano', 'Cor', 'Quilometragem', 'Preco', 'is_featured', 'Caminho_Fotos', 'Preco_Formatado'])
        
    except pd.errors.EmptyDataError:
        st.warning(f"Arquivo de vendas '{VENDAS_FILE}' está vazio. Cadastre um veículo para preenchê-lo.")
        return pd.DataFrame(columns=['ID', 'Tipo', 'Marca', 'Modelo', 'Ano', 'Cor', 'Quilometragem', 'Preco', 'is_featured', 'Caminho_Fotos', 'Preco_Formatado'])

    # --- Restante da Lógica (Se o arquivo for lido com sucesso) ---
    
    if 'Preco' in df_vendas.columns:
        df_vendas['Preco'] = pd.to_numeric(df_vendas['Preco'], errors='coerce').fillna(0).astype(int)
        df_vendas['Preco_Formatado'] = df_vendas['Preco'].apply(lambda x: f"R$ {x:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
    
    if 'is_featured' not in df_vendas.columns:
        df_vendas['is_featured'] = False
    
    if 'ID' not in df_vendas.columns:
         df_vendas['ID'] = range(1, len(df_vendas) + 1)
         
    if 'Caminho_Fotos' not in df_vendas.columns:
        df_vendas['Caminho_Fotos'] = ""
        
    return df_vendas


@st.cache_data
def load_veiculos_json(file_path=VEICULOS_FILE):
    """Carrega a lista mestre de Marcas/Modelos (do JSON)."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        st.error(f"Arquivo '{file_path}' (Lista Mestra) não encontrado.")
        return {} 
    return data

# --- Funções de Salvar Fotos ---

def save_uploaded_file(uploaded_file, vehicle_id, index):
    """Salva um arquivo de imagem na pasta de uploads."""
    file_extension = os.path.splitext(uploaded_file.name)[1]
    file_name = f"V{vehicle_id}_P{index}{file_extension}"
    file_path = os.path.join(UPLOADS_DIR, file_name)
    
    with open(file_path, "wb") as f:
        f.write(uploaded_file.getbuffer())
    
    return file_path

# --- Funções de Ordenação ---

def sort_marcas(marcas_list, prioridade=MARCAS_POPULARES):
    """Ordena as marcas colocando as prioritárias no início e o restante em ordem alfabética."""
    marcas_presentes = set(marcas_list)
    
    marcas_prioritarias = [m for m in prioridade if m in marcas_presentes]
    marcas_restantes = sorted([m for m in marcas_presentes if m not in prioridade])
    
    return marcas_prioritarias + marcas_restantes

# --- Função do Dashboard Principal (Seu App de Vendas) ---

def main_dashboard(df_vendas):
    """Contém a lógica principal do seu aplicativo de vendas de veículos."""
    
    # --- Sidebar/Menu de Navegação ---
    if st.session_state['user_role'] == 'admin':
        menu_opcoes = ["Catálogo", "Administração de Veículos"]
    else:
        menu_opcoes = ["Catálogo"]
        
    st.sidebar.title("Navegação")
    escolha_menu = st.sidebar.radio("Selecione:", menu_opcoes)
    
    st.sidebar.markdown("---")
    st.sidebar.header(f"👋 {st.session_state['user_name']} ({st.session_state['user_role'].capitalize()})")
    
    if st.sidebar.button("Sair (Logout)"):
        st.session_state.clear()
        st.rerun()
    
    # --- Renderização do Conteúdo ---
    
    if escolha_menu == "Catálogo":
        render_catalogo(df_vendas)
    
    elif escolha_menu == "Administração de Veículos":
        if st.session_state['user_role'] == 'admin':
            render_admin_veiculos(df_vendas)
        else:
            st.error("Acesso negado. Apenas administradores podem acessar esta página.")
    
# --- Renderização do Catálogo (Busca/Filtros) ---

def render_catalogo(df_vendas):
    
    st.markdown("<h1 style='text-align: center;'>🚗🏍️ Venda de Veículos Online 🏍️🚗</h1>", unsafe_allow_html=True)
    
    # --- INJEÇÃO DE CSS para Fundo Branco no Contêiner ---
    st.markdown("""
        <style>
            h1 { text-align: center; }
            .element-container:has(div[data-testid="stContainer"]) > div:first-child {
                background-color: white !important;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                margin-bottom: 20px;
            }
            .element-container:has(div[data-testid="stContainer"]) > div:first-child label {
                color: #333333; /* Cor escura para o label */
            }
        </style>
    """, unsafe_allow_html=True)

    if df_vendas.empty:
        st.warning("Nenhum veículo cadastrado para venda.")
        return

    veiculos_mestre = load_veiculos_json() 

    # --- 1. Filtros no Centro Superior (COM st.container nativo) ---

    col_left, col_center, col_right = st.columns([1, 4, 1])

    with col_center:
        with st.container(): 
            st.header("🔍 Opções de Busca")
            
            tipos_unicos = df_vendas['Tipo'].unique().tolist()
            tipo_selecionado = st.radio(
                "Selecione o Tipo de Veículo:",
                options=tipos_unicos,
                horizontal=True,
                index=0
            )
            
            df_tipo = df_vendas[df_vendas['Tipo'] == tipo_selecionado]
            termo_busca = st.text_input("Buscar por Modelo, Marca ou Cor:", placeholder="Ex: Civic, Toyota, Preto")
            
            # Sliders (Usam min/max do DF filtrado)
            col_a, col_b = st.columns(2)
            
            with col_a:
                min_preco_tipo = int(df_tipo['Preco'].min()) if not df_tipo.empty else 0
                max_preco_tipo = int(df_tipo['Preco'].max()) if not df_tipo.empty else 100000
                faixa_preco = st.slider(
                    "Faixa de Preço (R$):",
                    min_value=min_preco_tipo,
                    max_value=max_preco_tipo,
                    value=(min_preco_tipo, max_preco_tipo),
                    step=1000
                )
                
            with col_b:
                min_ano_tipo = int(df_tipo['Ano'].min()) if not df_tipo.empty else 2015
                max_ano_tipo = int(df_tipo['Ano'].max()) if not df_tipo.empty else 2025
                faixa_ano = st.slider(
                    "Faixa de Ano:",
                    min_value=min_ano_tipo,
                    max_value=max_ano_tipo,
                    value=(min_ano_tipo, max_ano_tipo),
                    step=1
                )
                
            # Multiselects
            col_c, col_d = st.columns(2)
            
            # 1. Marcas disponíveis no DF de vendas filtrado pelo tipo
            marcas_disponiveis = df_tipo['Marca'].unique().tolist()
            # 2. Ordena as marcas (populares primeiro, o resto em ordem alfabética)
            marcas_ordenadas = sort_marcas(marcas_disponiveis)
            
            with col_c:
                marca_selecionada = st.multiselect(
                    "Selecione a Marca(s):",
                    options=marcas_ordenadas,
                    default=[],
                    # Tradução do placeholder do multiselect (Escolha opções)
                    placeholder="Escolha uma ou mais marcas"
                )

            with col_d:
                modelos_globais = []
                if tipo_selecionado and marca_selecionada:
                    tipo_key = tipo_selecionado.lower()
                    
                    for item in veiculos_mestre.get(tipo_key, []):
                        if item['marca'] in marca_selecionada:
                            modelos_globais.extend(item['modelos'])
                    
                    modelos_filtrados_pelas_marcas = sorted(list(set(modelos_globais)))
                    
                    df_marcas = df_tipo[df_tipo['Marca'].isin(marca_selecionada)]
                    
                else:
                    df_marcas = pd.DataFrame()
                    modelos_filtrados_pelas_marcas = []
                
                modelo_selecionado = st.multiselect(
                    "Selecione o Modelo(s):",
                    options=modelos_filtrados_pelas_marcas,
                    default=[],
                    # Tradução do placeholder do multiselect (No options to select)
                    placeholder="Escolha um ou mais modelos"
                )
    
    st.markdown("---") 

    # --- 2. Aplicação e Exibição dos Resultados ---
    
    # Exibir a lista de veículos em destaque (favoritos)
    df_featured = df_vendas[(df_vendas['Tipo'] == tipo_selecionado) & (df_vendas.get('is_featured', False))]
    
    if not df_featured.empty:
        st.subheader("⭐ Veículos em Destaque (Favoritos)")
        st.dataframe(
            df_featured[['Marca', 'Modelo', 'Ano', 'Cor', 'Preco_Formatado', 'Quilometragem']],
            hide_index=True,
        )
        st.markdown("---")

    # Aplicação do restante dos filtros
    if not marca_selecionada or not modelo_selecionado:
        st.info("⚠️ Por favor, selecione pelo menos uma Marca e um Modelo para ver os resultados.")
        df_filtrado = pd.DataFrame()
    else:
        # 1. Filtro de texto (se existir)
        df_filtrado_texto = df_marcas.copy()
        if termo_busca:
            df_filtrado_texto = df_marcas[
                df_marcas.apply(lambda row: termo_busca.lower() in str(row[['Marca', 'Modelo', 'Cor']]).lower(), axis=1)
            ]

        # 2. Aplicação dos filtros numéricos e de modelo
        df_filtrado = df_filtrado_texto[
            (df_filtrado_texto['Modelo'].isin(modelo_selecionado)) &
            (df_filtrado_texto['Preco'] >= faixa_preco[0]) &
            (df_filtrado_texto['Preco'] <= faixa_preco[1]) &
            (df_filtrado_texto['Ano'] >= faixa_ano[0]) &
            (df_filtrado_texto['Ano'] <= faixa_ano[1])
        ]


    st.subheader(f"✅ Veículos Encontrados ({tipo_selecionado}): **{len(df_filtrado)}**")
    st.markdown("---")

    if not df_filtrado.empty:
        col1, col2 = st.columns([3, 2])
        
        with col1:
            st.markdown("### Tabela de Resultados")
            st.dataframe(
                df_filtrado[['Marca', 'Modelo', 'Ano', 'Cor', 'Quilometragem', 'Preco_Formatado']],
                hide_index=True,
                column_order=('Marca', 'Modelo', 'Ano', 'Cor', 'Quilometragem', 'Preco_Formatado'),
                column_config={
                    "Preco_Formatado": st.column_config.TextColumn("Preço")
                }
            )

        with col2:
            st.markdown("### Preços Médios por Marca")
            preco_medio = df_filtrado.groupby('Marca')['Preco'].mean().sort_values(ascending=False).round(2)
            st.bar_chart(preco_medio)

    elif marca_selecionada and modelo_selecionado:
        st.warning(f"Nenhum {tipo_selecionado.lower()} encontrado com os critérios de preço, ano ou termo de busca.")
        
    st.markdown("---")

# --- Renderização do Menu de Administração ---

def render_admin_veiculos(df_vendas):
    st.title("🛡️ Administração de Veículos")
    
    tab1, tab2 = st.tabs(["Cadastrar Novo Veículo", "Gerenciar Estoque e Destaques"])

    veiculos_mestre = load_veiculos_json()
    
    with tab1:
        st.subheader("Formulário de Cadastro")
        
        with st.form("cadastro_veiculo"):
            
            # --- Informações Básicas ---
            col_info1, col_info2 = st.columns(2)
            with col_info1:
                tipo_veiculo = st.selectbox("Tipo de Veículo:", ['Carros', 'Motos'])
                marcas_options = sort_marcas(sorted([item['marca'] for item in veiculos_mestre.get(tipo_veiculo.lower(), [])]))
                marca_selecionada = st.selectbox("Marca:", marcas_options, index=0)

            with col_info2:
                modelos_options = []
                if marca_selecionada:
                    for item in veiculos_mestre.get(tipo_veiculo.lower(), []):
                        if item['marca'] == marca_selecionada:
                            modelos_options = sorted(item['modelos'])
                            break
                modelo_selecionado = st.selectbox("Modelo:", modelos_options, index=0)
                
            
            # --- Detalhes ---
            col1, col2, col3 = st.columns(3)
            with col1:
                ano = st.number_input("Ano:", min_value=1900, max_value=2025, value=2020, step=1, help="Digite o ano de fabricação.")
            with col2:
                preco = st.number_input("Preço (R$):", min_value=1000, value=50000, step=1000, help="Digite o valor de venda.")
            with col3:
                km = st.number_input("Quilometragem:", min_value=0, value=10000, step=100, help="Digite a quilometragem atual.")
            
            cor = st.text_input("Cor:", placeholder="Ex: Preto")
            is_featured = st.checkbox("Marcar como DESTAQUE (Favorito) na loja?")
            
            # --- Upload de Fotos ---
            st.markdown("### 🖼️ Upload de Fotos do Veículo")
            uploaded_files = st.file_uploader(
                "Escolha até 5 fotos (JPG/PNG)",
                type=['png', 'jpg', 'jpeg'],
                accept_multiple_files=True
            )
            
            cadastrar_button = st.form_submit_button("Cadastrar Veículo")
            
            if cadastrar_button:
                if not modelo_selecionado or preco <= 0:
                    st.error("Preencha todos os campos obrigatórios (Marca, Modelo e Preço).")
                else:
                    # 1. Determinar o próximo ID do veículo
                    next_id = df_vendas['ID'].max() + 1 if not df_vendas.empty else 1
                    
                    # 2. Salvar as fotos e coletar os caminhos
                    caminhos_fotos = []
                    if uploaded_files:
                        for idx, file in enumerate(uploaded_files):
                            path = save_uploaded_file(file, next_id, idx + 1)
                            caminhos_fotos.append(path)
                    
                    # 3. Criar o novo registro
                    new_vehicle = {
                        'ID': next_id, 
                        'Tipo': tipo_veiculo,
                        'Marca': marca_selecionada,
                        'Modelo': modelo_selecionado,
                        'Ano': ano,
                        'Cor': cor,
                        'Quilometragem': km,
                        'Preco': preco,
                        'is_featured': is_featured,
                        'Caminho_Fotos': ";".join(caminhos_fotos) 
                    }
                    
                    # 4. Atualizar e Salvar
                    df_vendas = pd.concat([df_vendas, pd.DataFrame([new_vehicle])], ignore_index=True)
                    df_vendas.to_csv(VENDAS_FILE, index=False)
                    st.cache_data.clear()
                    st.success(f"Veículo {marca_selecionada} {modelo_selecionado} cadastrado com sucesso! ({len(caminhos_fotos)} foto(s) salvas.)")
                    time.sleep(1)
                    st.rerun()

    with tab2:
        st.subheader("Gerenciar Estoque, Destaques e Excluir")
        if df_vendas.empty:
            st.info("Nenhum veículo cadastrado.")
            return

        st.markdown("---")
        veiculo_id_excluir = st.selectbox(
            "Selecione o Veículo (ID - Marca - Modelo) para Excluir:",
            options=df_vendas[['ID', 'Marca', 'Modelo']].apply(lambda x: f"{x['ID']} - {x['Marca']} {x['Modelo']}", axis=1).tolist(),
            index=None,
            placeholder="Escolha um veículo para remover"
        )
        
        if st.button("🔴 Excluir Veículo Selecionado"):
            if veiculo_id_excluir:
                id_to_delete = int(veiculo_id_excluir.split(' - ')[0])
                
                df_vendas_new = df_vendas[df_vendas['ID'] != id_to_delete]
                df_vendas_new.to_csv(VENDAS_FILE, index=False)
                st.cache_data.clear()
                st.warning(f"Veículo ID {id_to_delete} excluído com sucesso.")
                st.rerun()
            else:
                st.error("Selecione um veículo para excluir.")
        st.markdown("---")
        
        st.markdown("### Ajustar Destaques e Visualizar Detalhes")
        df_vendas_editavel = st.data_editor(
            df_vendas[['ID', 'Tipo', 'Marca', 'Modelo', 'Ano', 'Preco_Formatado', 'is_featured', 'Caminho_Fotos']],
            hide_index=True,
            column_config={
                "is_featured": st.column_config.CheckboxColumn("Destaque?", help="Marque para colocar na seção de favoritos/destaque."),
                "Caminho_Fotos": st.column_config.TextColumn("Caminhos das Fotos", disabled=True),
                "Preco_Formatado": st.column_config.TextColumn("Preço", disabled=True),
            },
            num_rows="fixed",
            use_container_width=True
        )

        if st.button("Salvar Alterações de Destaques"):
            df_vendas['is_featured'] = df_vendas_editavel['is_featured']
            df_vendas.to_csv(VENDAS_FILE, index=False)
            st.cache_data.clear()
            st.success("Destaques atualizados com sucesso!")
            st.rerun()
            

# --- 4. Função de Login e Cadastro (Lógica Inalterada) ---

def login_page():
    """Exibe as opções de login e cadastro."""
    st.title("🔐 Acesso ao Sistema")
    
    choice = st.radio(
        "Selecione:", 
        ("Login", "Cadastro"), 
        horizontal=True
    )

    df_users = load_user_data()

    if choice == "Login":
        st.subheader("Entrar")

        with st.form("login_form"):
            email = st.text_input("Email", value=st.session_state['login_email'], key='login_email_input')
            st.session_state['login_email'] = email
            
            password = st.text_input("Senha", type='password', value=st.session_state['login_password'], key='login_password_input')
            st.session_state['login_password'] = password
            
            login_button = st.form_submit_button("Entrar")

            if login_button:
                user_record = df_users[df_users['email'] == email]
                if not user_record.empty:
                    stored_password_hash = user_record['password'].iloc[0]
                    if check_hashes(password, stored_password_hash):
                        st.session_state['logged_in'] = True
                        st.session_state['user_name'] = user_record['nome'].iloc[0]
                        st.session_state['user_role'] = user_record['role'].iloc[0]
                        st.success(f"Bem-vindo(a), {st.session_state['user_name']}!")
                        time.sleep(1)
                        st.rerun()
                    else:
                        st.error("Email ou senha incorretos.")
                else:
                    st.error("Usuário não encontrado.")

    elif choice == "Cadastro":
        st.subheader("Criar Nova Conta")
        
        with st.form("cadastro_form"):
            new_nome = st.text_input("Nome Completo", value=st.session_state['cadastro_nome'], key='cadastro_nome_input')
            st.session_state['cadastro_nome'] = new_nome
            
            new_email = st.text_input("Email", value=st.session_state['cadastro_email'], key='cadastro_email_input')
            st.session_state['cadastro_email'] = new_email
            
            new_password = st.text_input("Senha", type='password')
            confirm_password = st.text_input("Confirme a Senha", type='password')
            
            if df_users.empty:
                initial_role = 'admin'
                st.info("Você será o primeiro usuário e será configurado como Administrador.")
            else:
                initial_role = 'regular'
            
            cadastro_button = st.form_submit_button("Cadastrar")
            
            if cadastro_button:
                if new_password != confirm_password:
                    st.error("As senhas não coincidem.")
                elif len(df_users[df_users['email'] == new_email]) > 0:
                    st.warning("Este email já está cadastrado.")
                elif new_email and new_password and new_nome:
                    add_user_data(new_email, new_password, new_nome, initial_role)
                    st.success("Cadastro realizado com sucesso! Faça login.")
                else:
                    st.error("Preencha todos os campos.")


# --- 5. Lógica Principal do Aplicativo (Gerenciamento de Estado) ---

df_veiculos_vendas = load_vendas_data()

# Renderiza a página baseada no estado de login
if st.session_state['logged_in']:
    main_dashboard(df_veiculos_vendas)
else:
    login_page()