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
                <div className="container">
                    <h1>Fresh Organic Produce Direct from Certified Farmers</h1>
                    <p>Support local organic farmers and get the freshest produce delivered to your doorstep.</p>
                    <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
                </div>
            </section>

            {/* Featured Products */}
            <section className="section bg-light">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontWeight: 800, fontSize: '1.8rem' }}>Featured Products</h2>
                        <Link to="/products" className="btn btn-outline">View All</Link>
                    </div>

                    <div className="grid grid-4">
                        {loadingFeatured ? (
                            <p>Loading products...</p>
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