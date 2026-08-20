import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="wf-footer">
      <div className="wf-footer-inner">

        {/* Footer Brand */}
        <div className="wf-footer-brand">
          <div className="wf-footer-logo">
            <span>W</span>
            <strong>WorkFlow</strong>
          </div>

          <p>
            Work & Vacation Flow
          </p>
        </div>

        {/* Footer Links */}
        <div className="wf-footer-links">

          <a href="/terms">
            이용약관
          </a>

          <a
            href="/privacy"
            className="important"
          >
            개인정보처리방침
          </a>

          <a href="/help">
            고객센터
          </a>

          <a href="/faq">
            자주 묻는 질문
          </a>

        </div>

        {/* Copyright */}
        <div className="wf-footer-copyright">
          © 2026 WorkFlow. All rights reserved.
        </div>

      </div>
    </footer>
  );
}

export default Footer;