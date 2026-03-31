import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function Home() {
    const { getProducts } = useApp();

    const [featured, setFeatured] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const products = await getProducts(); // ✅ wait for backend
                if (Array.isArray(products)) {
                    setFeatured(products.slice(0, 4)); // ✅ now slice works
                } else {
                    setFeatured([]);
                }
            } catch (error) {
                console.error("Error loading products:", error);
                setFeatured([]);
            } finally {
                setLoadingFeatured(false);
            }
        };

        loadProducts();
    }, [getProducts]);

    return (
        <>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h1>Fresh Organic Produce Direct from Certified Farmers</h1>
                    <p>Support local organic farmers and get the freshest produce delivered to your doorstep.</p>
                    <div className="hero-buttons">
                        <Link to="/products" className="btn btn-light btn-lg"><i className="fas fa-shopping-basket" /> Shop Now</Link>
                        <Link to="/farmers" className="btn btn-outline-light btn-lg"><i className="fas fa-tractor" /> Join as Farmer</Link>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="section bg-light">
                <div className="container">
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '2rem',
                        flexWrap: 'wrap', gap: '1rem',
                    }}>
                        <div>
                            <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', margin: 0, color: 'var(--dark)' }}>
                                Featured <span style={{ color: 'var(--primary)' }}>Products</span>
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                Fresh, certified organic produce from trusted farmers
                            </p>
                        </div>
                        <Link to="/products" className="btn btn-outline" style={{ flexShrink: 0 }}>
                            <i className="fas fa-th-large" /> View All
                        </Link>
                    </div>

                    <div className="home-products-grid">
                        {loadingFeatured ? (
                            /* Skeleton loading cards */
                            [1, 2, 3, 4].map(i => (
                                <div key={i} style={{
                                    background: 'white', borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)', overflow: 'hidden',
                                    boxShadow: 'var(--shadow-sm)',
                                }}>
                                    <div style={{
                                        height: '180px',
                                        background: 'linear-gradient(90deg, #d8f3dc 25%, #e8f7ee 50%, #d8f3dc 75%)',
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 1.4s infinite',
                                    }} />
                                    <div style={{ padding: '1rem' }}>
                                        {[80, 60, 40].map((w, j) => (
                                            <div key={j} style={{
                                                height: '12px', borderRadius: '6px', marginBottom: '0.6rem',
                                                width: `${w}%`,
                                                background: 'linear-gradient(90deg, #d8f3dc 25%, #e8f7ee 50%, #d8f3dc 75%)',
                                                backgroundSize: '200% 100%',
                                                animation: 'shimmer 1.4s infinite',
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : featured.length === 0 ? (
                            <div style={{
                                gridColumn: '1 / -1', textAlign: 'center',
                                padding: '3rem', color: 'var(--text-muted)',
                            }}>
                                <i className="fas fa-seedling" style={{ fontSize: '3rem', opacity: 0.4, display: 'block', marginBottom: '1rem' }} />
                                <p>No products yet. Check back soon!</p>
                                <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Products</Link>
                            </div>
                        ) : (
                            featured.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}