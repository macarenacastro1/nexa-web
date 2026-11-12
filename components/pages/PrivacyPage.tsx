"use client";
import { CONFIG } from "@/lib/config";
import { useL } from "@/lib/i18n";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

/**
 * Política de privacidad. Describe lo que la web hace hoy: el formulario
 * guarda la consulta en el CRM de Nexa (Supabase), avisa por mail al equipo
 * (Resend) y la web mide visitas con Google Analytics.
 * Versión 2026-11 · pendiente de revisión legal.
 */
export default function PrivacyPage() {
  const L = useL();
  const mail = CONFIG.contactEmail;
  const S = L(
    [
      ["Quiénes somos", `The Nexa Company («Nexa») es un estudio de tecnología, diseño y transformación digital. Somos responsables de los datos que nos dejás en esta web. Para cualquier consulta sobre tus datos escribinos a ${mail}.`],
      ["Qué datos recopilamos", "Cuando completás el formulario de contacto: nombre, email, empresa o marca (opcional), teléfono o WhatsApp (opcional), el tipo de proyecto y el mensaje que escribís. También registramos la página desde la que escribiste, el idioma, los parámetros de campaña de la dirección (si los hay) y una huella anónima de tu conexión para prevenir spam. No te pedimos datos sensibles."],
      ["Para qué los usamos", "Solo para responder tu consulta, preparar una propuesta si la pedís y hacer el seguimiento comercial de esa conversación. No vendemos ni cedemos tus datos a terceros para publicidad."],
      ["Dónde se guardan", "Las consultas se guardan en el sistema de gestión interno de Nexa, alojado en Supabase. Para avisarnos de cada consulta usamos un servicio de envío de mails (Resend). Estos proveedores pueden almacenar datos fuera de Argentina o de Brasil, con medidas de seguridad adecuadas."],
      ["Medición de visitas", "Usamos Google Analytics para entender cómo se usa la web (por ejemplo, qué secciones se visitan o si se envió un formulario). No enviamos a Google Analytics tu nombre, tu email ni el contenido de tu mensaje."],
      ["Cuánto tiempo los guardamos", "Mientras dure la conversación comercial y, si no avanzamos, hasta 24 meses después del último contacto. Podés pedir que los borremos antes en cualquier momento."],
      ["Tus derechos", `Podés pedir acceso, rectificación, actualización o eliminación de tus datos escribiendo a ${mail}. En Argentina, la Agencia de Acceso a la Información Pública es el órgano de control de la Ley 25.326 de Protección de Datos Personales y atiende denuncias y reclamos.`],
      ["Seguridad", "Aplicamos medidas técnicas y organizativas razonables: acceso restringido al sistema, conexiones cifradas y claves fuera del código de la web."],
      ["Cambios", "Si cambiamos esta política, publicamos la nueva versión en esta página con su fecha."],
    ],
    [
      ["Quem somos", `A The Nexa Company («Nexa») é um estúdio de tecnologia, design e transformação digital. Somos responsáveis pelos dados que você deixa neste site. Para qualquer dúvida sobre seus dados, escreva para ${mail}.`],
      ["Quais dados coletamos", "Quando você preenche o formulário de contato: nome, e-mail, empresa ou marca (opcional), telefone ou WhatsApp (opcional), o tipo de projeto e a mensagem que você escreve. Também registramos a página de onde escreveu, o idioma, os parâmetros de campanha do endereço (se houver) e uma marca anônima da sua conexão para prevenir spam. Não pedimos dados sensíveis."],
      ["Para que usamos", "Apenas para responder sua mensagem, preparar uma proposta se você pedir e acompanhar comercialmente essa conversa. Não vendemos nem cedemos seus dados a terceiros para publicidade."],
      ["Onde ficam armazenados", "As mensagens ficam no sistema de gestão interno da Nexa, hospedado no Supabase. Para nos avisar de cada mensagem usamos um serviço de envio de e-mails (Resend). Esses fornecedores podem armazenar dados fora da Argentina ou do Brasil, com medidas de segurança adequadas."],
      ["Medição de visitas", "Usamos o Google Analytics para entender como o site é usado (por exemplo, quais seções são visitadas ou se um formulário foi enviado). Não enviamos ao Google Analytics seu nome, seu e-mail nem o conteúdo da sua mensagem."],
      ["Por quanto tempo guardamos", "Enquanto durar a conversa comercial e, se não avançarmos, até 24 meses após o último contato. Você pode pedir a exclusão antes, a qualquer momento."],
      ["Seus direitos (LGPD)", `Você pode solicitar confirmação, acesso, correção, anonimização, portabilidade ou exclusão dos seus dados, e revogar seu consentimento, escrevendo para ${mail}. No Brasil, você também pode recorrer à Autoridade Nacional de Proteção de Dados (ANPD).`],
      ["Segurança", "Aplicamos medidas técnicas e organizacionais razoáveis: acesso restrito ao sistema, conexões criptografadas e chaves fora do código do site."],
      ["Mudanças", "Se mudarmos esta política, publicamos a nova versão nesta página com a data."],
    ],
  );
  return (
    <>
      <Nav />
      <main id="main" className="dp legal">
        <section className="dp-hero" aria-labelledby="legal-title">
          <div className="container legal__wrap">
            <p className="label">{L("Legal", "Legal")}</p>
            <h1 className="dp-hero__title" id="legal-title">{L("Privacidad y", "Privacidade e")} <span className="serif ctrl">{L("datos personales.", "dados pessoais.")}</span></h1>
            <p className="legal__meta">{L("Versión de noviembre de 2026", "Versão de novembro de 2026")}</p>
            {S.map(([t, d]) => (
              <section key={t} className="legal__sec">
                <h2>{t}</h2>
                <p>{d}</p>
              </section>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
