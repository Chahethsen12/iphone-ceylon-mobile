import { useState, useEffect, useMemo } from 'react';
import { FaTrash, FaPlus, FaImage, FaEdit } from 'react-icons/fa';
import { Package, AlertCircle, Zap, Star, ShieldCheck, X } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  flexRender 
} from '@tanstack/react-table';
import apiAuth from '../utils/apiAuth';

export default function ProductsDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Phones',
    price: '',
    stock: '',
    description: '',
    isFeatured: false,
    isFlashSale: false
  });

  // Table Columns Definition
  const columns = useMemo(() => [
    {
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }) => {
        const product = row.original;
        return product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-xl border border-gray-100 shadow-sm" />
        ) : (
          <div className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-xl border border-gray-100 text-gray-300">
            <FaImage />
          </div>
        );
      }
    },
    {
      accessorKey: 'name',
      header: 'Product Details',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{product.name}</span>
            <div className="flex items-center space-x-2 mt-1">
               {product.isFeatured && (
                  <span className="inline-flex items-center bg-amber-50 text-amber-600 text-[10px] font-black uppercase px-1.5 py-0.5 rounded border border-amber-100">
                    <Star size={10} className="mr-1 fill-current" /> Hero
                  </span>
               )}
               {product.isFlashSale && (
                  <span className="inline-flex items-center bg-rose-50 text-rose-600 text-[10px] font-black uppercase px-1.5 py-0.5 rounded border border-rose-100">
                    <Zap size={10} className="mr-1 fill-current" /> Flash
                  </span>
               )}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: info => <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">{info.getValue()}</span>
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: info => <span className="font-black text-gray-900">Rs. {info.getValue().toLocaleString()}</span>
    },
    {
      accessorKey: 'stock',
      header: 'Inventory',
      cell: ({ row }) => {
        const stock = row.original.stock;
        return (
          <div className="flex items-center">
            {stock < 5 ? (
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition ${stock > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                {stock > 0 ? <AlertCircle size={12} /> : null}
                <span>{stock > 0 ? `${stock} LOW` : 'OUT OF STOCK'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheck size={12} />
                <span>{stock} units</span>
              </span>
            )}
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition duration-200">
            <button 
              onClick={() => openEditModal(product)}
              className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition duration-300"
            >
              <FaEdit size={14} />
            </button>
            <button 
              onClick={() => handleDelete(product._id)}
              className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition duration-300"
            >
              <FaTrash size={14} />
            </button>
          </div>
        );
      }
    }
  ], []);

  // Initialize TanStack Table
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const { data } = await apiAuth.get('/products');
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await apiAuth.delete(`/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Error deleting product.");
      }
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ 
      name: '', 
      category: 'Phones', 
      price: '', 
      stock: '', 
      description: '',
      isFeatured: false,
      isFlashSale: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setEditId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description,
      isFeatured: product.isFeatured || false,
      isFlashSale: product.isFlashSale || false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      if (isEditing) {
        await apiAuth.put(`/products/${editId}`, payload);
      } else {
        await apiAuth.post('/products', payload);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Failed to save product", error);
      alert("Error saving product.");
    }
  };

  if (loading) return <div className="p-8"><Skeleton count={8} height={70} /></div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
           <p className="text-gray-500 mt-1">Manage stock, featured products, and flash sales.</p>
        </div>
        <div className="flex space-x-3">
           <button 
             onClick={() => setIsBulkModalOpen(true)}
             className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-bold flex items-center transition border border-gray-200 shadow-sm"
           >
             <Zap className="mr-2 text-rose-500" /> Bulk Update
           </button>
           <button 
             onClick={openAddModal}
             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center transition shadow-lg shadow-blue-500/30"
           >
             <FaPlus className="mr-2" /> Add Product
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="p-5 font-black">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="group hover:bg-gray-50/80 transition duration-200">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" className="p-20 text-center">
                   <Package size={48} className="mx-auto text-gray-200 mb-4" />
                   <p className="text-gray-400 font-medium">No products found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-white text-sm text-gray-500">
          <span>Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of <strong>{table.getPageCount()}</strong></span>
          <div className="flex space-x-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-4 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition disabled:opacity-30">Previous</button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-4 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition disabled:opacity-30">Next</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div>
                 <h2 className="text-2xl font-black text-gray-900">{isEditing ? 'Edit Product' : 'New Product'}</h2>
                 <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">Catalog Entry</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold">
                       <option value="Phones">Phones</option>
                       <option value="Mac">Mac</option>
                       <option value="iPad">iPad</option>
                       <option value="Accessories">Accessories</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Base Price (LKR)</label>
                    <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Stock Level</label>
                    <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Marketing Badges</label>
                 <div className="flex space-x-4">
                    <button 
                       type="button"
                       onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
                       className={`flex-1 p-4 rounded-2xl border-2 transition flex items-center justify-center space-x-2 ${formData.isFeatured ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                    >
                       <Star size={18} className={formData.isFeatured ? 'fill-current' : ''} />
                       <span className="font-bold">Featured Hero</span>
                    </button>
                    <button 
                       type="button"
                       onClick={() => setFormData({...formData, isFlashSale: !formData.isFlashSale})}
                       className={`flex-1 p-4 rounded-2xl border-2 transition flex items-center justify-center space-x-2 ${formData.isFlashSale ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                    >
                       <Zap size={18} className={formData.isFlashSale ? 'fill-current' : ''} />
                       <span className="font-bold">Flash Sale</span>
                    </button>
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                 <textarea required rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"></textarea>
              </div>

              <div className="pt-4 flex space-x-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">Discard</button>
                 <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                    {isEditing ? 'Update Records' : 'Publish Product'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                 <h2 className="text-2xl font-black text-gray-900">Bulk Adjust Prices</h2>
                 <button onClick={() => setIsBulkModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
              </div>
              <form onSubmit={async (e) => {
                 e.preventDefault();
                 const cat = e.target.category.value;
                 const pct = Number(e.target.percentage.value);
                 if (window.confirm(`Adjust all ${cat} prices by ${pct}%?`)) {
                    try {
                       await apiAuth.post('/products/bulk-price', { category: cat, percentage: pct });
                       setIsBulkModalOpen(false);
                       fetchProducts();
                    } catch (err) {
                       alert("Bulk update failed.");
                    }
                 }
              }} className="p-8 space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category Selection</label>
                    <select name="category" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold">
                       <option value="All">All Categories</option>
                       <option value="Phones">Phones</option>
                       <option value="Mac">Mac</option>
                       <option value="iPad">iPad</option>
                       <option value="Accessories">Accessories</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Percentage Change (+ or -)</label>
                    <input name="percentage" type="number" step="0.1" required placeholder="e.g. 10 or -5" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                 </div>
                 <div className="pt-4 flex space-x-4">
                    <button type="button" onClick={() => setIsBulkModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold">Cancel</button>
                    <button type="submit" className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-500/30">Apply Changes</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
