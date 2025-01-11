import Header from '../components/Header'
import Footer from '../components/Footer'

export default function PoliticaDePrivacidade() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Política de Privacidade</h1>
        <div className="prose max-w-none">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <h2>1. Introdução</h2>
          <p>Bem-vindo à Política de Privacidade do CondoIndica. Esta política descreve como coletamos, usamos, processamos e protegemos suas informações pessoais quando você utiliza nosso aplicativo e serviços relacionados.</p>

          <h2>2. Informações que Coletamos</h2>
          <p>Podemos coletar os seguintes tipos de informações:</p>
          <ul>
            <li>Informações de registro: nome, endereço de e-mail, senha</li>
            <li>Informações de perfil: foto, endereço, número de telefone</li>
            <li>Informações de uso: interações com o aplicativo, indicações feitas, avaliações</li>
            <li>Informações do dispositivo: tipo de dispositivo, sistema operacional, identificadores únicos</li>
          </ul>

          <h2>3. Como Usamos Suas Informações</h2>
          <p>Utilizamos suas informações para:</p>
          <ul>
            <li>Fornecer e melhorar nossos serviços</li>
            <li>Personalizar sua experiência</li>
            <li>Processar transações e gerenciar sua conta</li>
            <li>Comunicar-nos com você sobre atualizações, ofertas e promoções</li>
            <li>Garantir a segurança e integridade de nossos serviços</li>
          </ul>

          <h2>4. Compartilhamento de Informações</h2>
          <p>Podemos compartilhar suas informações com:</p>
          <ul>
            <li>Outros usuários do CondoIndica, conforme necessário para o funcionamento do serviço</li>
            <li>Prestadores de serviços que nos auxiliam na operação do aplicativo</li>
            <li>Autoridades legais, quando exigido por lei</li>
          </ul>

          <h2>5. Segurança de Dados</h2>
          <p>Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.</p>

          <h2>6. Seus Direitos</h2>
          <p>Você tem o direito de:</p>
          <ul>
            <li>Acessar e receber uma cópia de suas informações pessoais</li>
            <li>Retificar informações imprecisas</li>
            <li>Solicitar a exclusão de suas informações</li>
            <li>Opor-se ao processamento de suas informações</li>
            <li>Retirar seu consentimento a qualquer momento</li>
          </ul>

          <h2>7. Retenção de Dados</h2>
          <p>Mantemos suas informações pessoais pelo tempo necessário para fornecer nossos serviços e cumprir nossas obrigações legais.</p>

          <h2>8. Alterações nesta Política</h2>
          <p>Podemos atualizar esta política periodicamente. Notificaremos você sobre quaisquer alterações significativas por e-mail ou através de um aviso em nosso aplicativo.</p>

          <h2>9. Cookies e Tecnologias Similares</h2>
          <p>Utilizamos cookies e tecnologias similares para melhorar a experiência do usuário, analisar o tráfego e personalizar conteúdo.</p>

          <h2>10. Transferências Internacionais de Dados</h2>
          <p>Suas informações podem ser transferidas e processadas em servidores localizados fora do seu país de residência, onde as leis de proteção de dados podem ser diferentes.</p>

          <h2>11. Contato</h2>
          <p>Se você tiver dúvidas ou preocupações sobre esta política de privacidade ou nossas práticas de dados, entre em contato conosco:</p>
          <ul>
            <li>E-mail: sac@condoindica.com.br</li>
            <li>WhatsApp: (41) 93300-8957</li>
          </ul>

          <p>Esta política de privacidade se aplica a todos os serviços oferecidos pelo CondoIndica através do site https://condoindica.com.br e nosso aplicativo móvel.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

