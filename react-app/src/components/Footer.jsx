import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <h5><i className="fas fa-leaf" style={{ color: 'var(--primary)' }}></i> OrganicFarm</h5>
                        <p>Connecting certified organic farmers with conscious consumers for a healthier tomorrow.</p>
                        <div className="social-links">
                            <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
                            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                            <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
                        </div>
                    </div>
                    <div>
                        <h6>Quick Links</h6>
                        <ul>
                            <li><Link to="/products">Products</Link></li>
                            <li><Link to="/farmers">For Farmers</Link></li>
                            <li><Link to="/ai-tools">AI Tools</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h6>Support</h6>
                        <ul>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><a href="#">FAQs</a></li>
                            <li><a href="#">Shipping Policy</a></li>
                            <li><a href="#">Return Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h6>Contact</h6>
                        <ul style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}><i className="fas fa-map-marker-alt" style={{ marginRight: '0.5rem' }}></i>123 Farm Street, City</li>
                            <li style={{ marginBottom: '0.5rem' }}><i className="fas fa-phone" style={{ marginRight: '0.5rem' }}></i>+91 12345 67890</li>
                            <li><i className="fas fa-envelope" style={{ marginRight: '0.5rem' }}></i>info@organicfarm.com</li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 OrganicFarm. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
