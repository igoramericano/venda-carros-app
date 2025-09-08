export class User {
  static async me() {
    return {
      email: "teste@anuncios.com",
      full_name: "Usuário Teste"
    };
  }
}