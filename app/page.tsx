import Nav from "@/components/Nav";
import ChaosStage from "@/components/ChaosStage";
import Intelligence from "@/components/Intelligence";
import Business from "@/components/Business";
import Impact from "@/components/Impact";
import { CONFIG, waUrl } from "@/lib/config";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <ChaosStage />
        <Intelligence />
        <Business />
        <Impact />
      </main>
      <footer className="footer">
        <div className="container">
          <span className="logo" style={{ fontSize: 15 }}><span className="logo__mark" style={{ width: 22, height: 22, fontSize: 12 }}>N</span>{CONFIG.brandFull}</span>
          <span>© {new Date().getFullYear()}</span>
          <nav>
            <a href="#">Instagram</a>
            <a href="#">LinkedIn</a>
            <a href={waUrl} target="_blank" rel="noopener">WhatsApp</a>
          </nav>
        </div>
      </footer>
      <a href={waUrl} target="_blank" rel="noopener" className="wa-float" aria-label="Escribinos por WhatsApp">
        <svg viewBox="0 0 32 32"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-4-.5-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.8 5 2.2.9 3 1 4 .8.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" /></svg>
      </a>
    </>
  );
}
