import { useApp } from '../context/AppContext';

function StarRating({ rating }) {
    return (
        <div className="rating">
            {[1, 2, 3, 4, 5].map(i => (
                <i key={i} className={`fas fa-star${i <= rating ? '' : i - 0.5 <= rating ? '-half-alt' : ' far fa-star'}`}
                    style={{ color: i - 0.5 <= rating ? '#ffc107' : '#dee2e6' }}></i>
            ))}
        </div>
    );
}

export default function ProductCard({ product, showActions = false, onEdit, onDelete }) {
    const { addToCart } = useApp();

    return (
        <div className="product-card">
            <div style={{ position: 'relative' }}>
                <img src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'} alt={product.name} />
                {product.certified && (
                    <span className="product-badge">
                        <i className="fas fa-certificate"></i> Certified
                    </span>
                )}
            </div>
            <div className="product-info">
                <h5>{product.name}</h5>
                {product.farmer && <p className="product-farmer"><i className="fas fa-store"></i> {product.farmer}</p>}
                <StarRating rating={product.rating || 0} />
                {product.desc && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{product.desc}</p>}
                <div className="product-footer">
                    <span className="product-price">₹{product.price}/kg</span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => addToCart(product)}>
                            <i className="fas fa-cart-plus"></i> Add
                        </button>
                        {showActions && (
                            <>
                                <button className="btn btn-sm" style={{ background: '#e8f4ff', color: '#0066cc', border: 'none' }} onClick={() => onEdit(product)}>
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button className="btn btn-sm" style={{ background: '#fde8e8', color: 'var(--danger)', border: 'none' }} onClick={() => onDelete(product.id)}>
                                    <i className="fas fa-trash"></i>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
