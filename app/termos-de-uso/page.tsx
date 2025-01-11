import Header from '../components/Header'
import Footer from '../components/Footer'

export default function TermosDeUso() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Termos de Uso</h1>
        <div className="prose max-w-none">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <h2>1. Aceitação dos Termos</h2>
          <p>Ao acessar ou usar o CondoIndica, você concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site.</p>

          <h2>2. Uso do Serviço</h2>
          <p>O CondoIndica é uma plataforma que permite aos usuários compartilhar e acessar recomendações de serviços para condomínios. Ao usar nosso serviço, você concorda em:</p>
          <ul>
            <li>Fornecer informações precisas e atualizadas ao criar uma conta</li>
            <li>Manter a confidencialidade de sua senha e conta</li>
            <li>Não usar o serviço para qualquer finalidade ilegal ou não autorizada</li>
            <li>Não violar quaisquer leis em sua jurisdição (incluindo, mas não se limitando a, leis de direitos autorais)</li>
          </ul>

          <h2>3. Conteúdo do Usuário</h2>
          <p>Nosso serviço permite que você poste, compartilhe e armazene conteúdo, incluindo recomendações, avaliações e comentários. Você retém todos os direitos sobre o conteúdo que fornece ao CondoIndica. No entanto, ao postar conteúdo, você nos concede uma licença mundial, não exclusiva, livre de royalties para usar, modificar, executar publicamente, exibir publicamente e distribuir seu conteúdo em conexão com o serviço.</p>

          <h2>4. Responsabilidades do Usuário</h2>
          <p>Você é responsável por suas atividades no CondoIndica e por qualquer conteúdo que fornecer. Especificamente, você concorda em não:</p>
          <ul>
            <li>Postar conteúdo falso, impreciso, enganoso ou difamatório</li>
            <li>Violar a privacidade de outros usuários ou divulgar informações pessoais sem consentimento</li>
            <li>Usar o serviço para enviar spam, publicidade não solicitada ou conteúdo malicioso</li>
            <li>Tentar acessar contas de outros usuários ou partes restritas do serviço</li>
            <li>Interferir ou interromper o serviço ou servidores ou redes conectadas ao serviço</li>
          </ul>

          <h2>5. Propriedade Intelectual</h2>
          <p>O serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão propriedade exclusiva do CondoIndica e seus licenciadores. O serviço é protegido por direitos autorais, marcas registradas e outras leis. Nossas marcas registradas não podem ser usadas em conexão com qualquer produto ou serviço sem o consentimento prévio por escrito do CondoIndica.</p>

          <h2>6. Rescisão</h2>
          <p>Podemos encerrar ou suspender sua conta e barrar o acesso ao serviço imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos de Uso.</p>

          <h2>7. Limitação de Responsabilidade</h2>
          <p>Em nenhum caso o CondoIndica, nem seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados, serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes de:</p>
          <ul>
            <li>Seu acesso ou uso ou incapacidade de acessar ou usar o serviço</li>
            <li>Qualquer conduta ou conteúdo de terceiros no serviço</li>
            <li>Qualquer conteúdo obtido do serviço</li>
            <li>Acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo</li>
          </ul>

          <h2>8. Isenção de Garantias</h2>
          <p>Seu uso do serviço é por sua conta e risco. O serviço é fornecido "como está" e "conforme disponível", sem garantias de qualquer tipo, expressas ou implícitas.</p>

          <h2>9. Lei Aplicável</h2>
          <p>Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas disposições sobre conflitos de leis.</p>

          <h2>10. Alterações nos Termos</h2>
          <p>Reservamo-nos o direito, a nosso critério exclusivo, de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos entrem em vigor.</p>

          <h2>11. Contato</h2>
          <p>Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco:</p>
          <ul>
            <li>E-mail: sac@condoindica.com.br</li>
            <li>WhatsApp: (41) 93300-8957</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  )
}

