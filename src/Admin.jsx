import { useState, useEffect } from 'react';
import axios from 'axios';

function Admin() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [historyUsers, setHistoryUsers] = useState([]);
    // 🔥 New State for Deposits
    const [pendingDeposits, setPendingDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 🔍 Modals အတွက် States
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedSlip, setSelectedSlip] = useState(null); // Slip ပုံကြည့်ရန်
    const [activeTab, setActiveTab] = useState('deposits'); // 'deposits' or 'kyc' or 'history'

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [pendingRes, historyRes, depositRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/pending-users', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/admin/verification-history', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                // 🔥 Deposit API အသစ်
                axios.get('http://localhost:5000/api/admin/pending-deposits', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setPendingUsers(pendingRes.data);
            setHistoryUsers(historyRes.data);
            setPendingDeposits(depositRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching admin data");
            setLoading(false);
        }
    };

    // --- KYC VERIFY FUNCTION ---
    const handleVerify = async (userId, status) => {
        let reason = "";

        if (status === 'Unverified') {
            reason = prompt("Please specify the reason for rejection (e.g., Blur image, NRC mismatch):");
            if (reason === null) return;
            if (!reason.trim()) return alert("Rejection reason is required!");
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/admin/verify-user', 
                { userId, status, reason: status === 'Unverified' ? reason : "" },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(`Execution Successful: User is now ${status}`);
            setSelectedUser(null);
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.message || "Action failed");
        }
    };

    // --- 🔥 DEPOSIT VERIFY FUNCTION ---
    const handleVerifyDeposit = async (transactionId, status) => {
        if(!window.confirm(`Are you sure you want to ${status} this deposit?`)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/admin/verify-deposit', 
                { transactionId, status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`Deposit ${status} Successfully!`);
            setSelectedSlip(null);
            fetchAllData();
        } catch (err) {
            alert("Approval process failed");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-yellow-500 font-black tracking-[0.2em] animate-pulse uppercase">
            Initializing Admin Terminal...
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12 space-y-10 relative">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <span className="text-yellow-500">👑</span> Admin Core
                    </h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Centralized Management System (CMS)</p>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex bg-[#1E2329] p-1.5 rounded-2xl border border-[#2B3139]">
                    {[
                        { id: 'deposits', label: 'Pending Deposits', count: pendingDeposits.length },
                        { id: 'kyc', label: 'Identity Requests', count: pendingUsers.length },
                        { id: 'history', label: 'Logs', count: historyUsers.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                activeTab === tab.id ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab.label}
                            {tab.count > 0 && <span className={`px-2 py-0.5 rounded-full text-[8px] ${activeTab === tab.id ? 'bg-black/20' : 'bg-yellow-500/20 text-yellow-500'}`}>{tab.count}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- 🌟 1. PENDING DEPOSITS TAB --- */}
            {activeTab === 'deposits' && (
                <div className="bg-[#1E2329] rounded-3xl border border-[#2B3139] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0B0E11]/50 text-gray-500 uppercase text-[10px] font-black tracking-[0.15em] border-b border-[#2B3139]">
                                <tr>
                                    <th className="px-8 py-6">Transaction Date</th>
                                    <th className="px-8 py-6">Account Email</th>
                                    <th className="px-8 py-6">Method</th>
                                    <th className="px-8 py-6 text-right">Amount (USDT)</th>
                                    <th className="px-8 py-6 text-center">Receipt</th>
                                    <th className="px-8 py-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2B3139]">
                                {pendingDeposits.length === 0 ? (
                                    <tr><td colSpan="6" className="p-24 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">No pending deposit requests</td></tr>
                                ) : (
                                    pendingDeposits.map(trx => (
                                        <tr key={trx._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6 text-xs text-gray-400">{new Date(trx.createdAt).toLocaleString()}</td>
                                            <td className="px-8 py-6 font-bold text-white">{trx.email}</td>
                                            <td className="px-8 py-6">
                                                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">{trx.method}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-mono font-black text-yellow-500 text-lg">${trx.amount.toFixed(2)}</td>
                                            <td className="px-8 py-6 text-center">
                                                <button onClick={() => setSelectedSlip(trx)} className="bg-[#0B0E11] border border-[#2B3139] hover:border-white text-gray-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition tracking-widest">View Slip</button>
                                            </td>
                                            <td className="px-8 py-6 text-right space-x-2">
                                                <button onClick={() => handleVerifyDeposit(trx._id, 'Approved')} className="bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase transition">Approve</button>
                                                <button onClick={() => handleVerifyDeposit(trx._id, 'Rejected')} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase transition">Reject</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- 🌟 2. PENDING KYC TAB --- */}
            {activeTab === 'kyc' && (
                <div className="bg-[#1E2329] rounded-3xl border border-[#2B3139] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0B0E11]/50 text-gray-500 uppercase text-[10px] font-black tracking-[0.15em] border-b border-[#2B3139]">
                                <tr>
                                    <th className="px-8 py-6">User Intelligence</th>
                                    <th className="px-8 py-6">Identity Summary</th>
                                    <th className="px-8 py-6 text-right">Execution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2B3139]">
                                {pendingUsers.length === 0 ? (
                                    <tr><td colSpan="3" className="p-24 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">No pending identity verifications</td></tr>
                                ) : (
                                    pendingUsers.map(u => (
                                        <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <p className="text-white font-bold group-hover:text-yellow-500 transition-colors">{u.email}</p>
                                                <p className="text-[10px] text-gray-500 font-black mt-1 uppercase">UID: {u._id.substring(0, 10)}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-white font-black uppercase text-xs tracking-wide">{u.kycDetails?.fullName || 'N/A'}</p>
                                                <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase">ID: {u.kycDetails?.idNumber || 'N/A'}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={() => setSelectedUser(u)} className="bg-[#0B0E11] border border-[#2B3139] hover:border-yellow-500 text-gray-300 hover:text-yellow-500 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition flex items-center gap-2 ml-auto">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- 🌟 3. HISTORY TAB --- */}
            {activeTab === 'history' && (
                <div className="bg-[#1E2329] rounded-3xl border border-[#2B3139] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0B0E11]/50 text-gray-500 uppercase text-[10px] font-black tracking-[0.15em]">
                                <tr>
                                    <th className="px-8 py-5">User Email</th>
                                    <th className="px-8 py-5">Final Status</th>
                                    <th className="px-8 py-5">Inspector</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2B3139]">
                                {historyUsers.map(u => (
                                    <tr key={u._id} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-300">{u.email}</p>
                                            <p className="text-gray-500 text-[10px] mt-1">{u.kycDetails?.phoneNumber}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.isVerified === 'Verified' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{u.isVerified}</span>
                                        </td>
                                        <td className="px-8 py-6 text-gray-500 text-xs font-medium italic">
                                            <p>{u.kycDetails?.reviewedBy || 'System'}</p>
                                            <p className="text-[9px] mt-1 uppercase font-black">{new Date(u.kycDetails?.reviewDate).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={() => setSelectedUser(u)} className="text-gray-500 hover:text-yellow-500 font-black text-[10px] uppercase flex items-center gap-1 ml-auto">View Record</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- 🖼️ PAYMENT SLIP MODAL --- */}
            {selectedSlip && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-[#1E2329] border border-[#2B3139] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => setSelectedSlip(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white bg-[#0B0E11] p-2 rounded-full transition z-10">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3">
                                <span>🧾</span> Deposit Verification
                            </h2>
                            <div className="bg-[#0B0E11] rounded-2xl p-6 mb-6 grid grid-cols-2 gap-6 border border-[#2B3139]">
                                <div><p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">User Email</p><p className="text-white font-bold text-sm truncate">{selectedSlip.email}</p></div>
                                <div><p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Amount</p><p className="text-yellow-500 font-black text-xl">${selectedSlip.amount}</p></div>
                                <div><p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Method</p><p className="text-white font-bold text-sm">{selectedSlip.method}</p></div>
                                <div><p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Status</p><p className="text-blue-500 font-bold text-sm">{selectedSlip.status}</p></div>
                            </div>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Transfer Evidence (Slip)</p>
                            <a href={`http://localhost:5000${selectedSlip.slipImage}`} target="_blank" rel="noreferrer">
                                <img src={`http://localhost:5000${selectedSlip.slipImage}`} className="w-full rounded-2xl border border-[#2B3139] hover:opacity-90 transition cursor-zoom-in" alt="Payment Slip" />
                            </a>
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <button onClick={() => handleVerifyDeposit(selectedSlip._id, 'Rejected')} className="py-4 rounded-xl bg-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">Reject Payment</button>
                                <button onClick={() => handleVerifyDeposit(selectedSlip._id, 'Approved')} className="py-4 rounded-xl bg-green-500 text-black font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20">Approve & Fund</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 🔍 IDENTITY PROFILE MODAL (Existing) --- */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1E2329] border border-[#2B3139] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white bg-[#0B0E11] p-2 rounded-full transition z-10">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="p-8 border-b border-[#2B3139]"><h2 className="text-2xl font-black text-white uppercase tracking-tighter">Identity Profile</h2></div>
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div><p className="text-[#2B3139] text-[10px] font-black uppercase tracking-widest mb-1">Account Email</p><p className="text-white font-bold">{selectedUser.email}</p></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-[#2B3139] text-[10px] font-black uppercase tracking-widest mb-1">Full Name</p><p className="text-white font-bold">{selectedUser.kycDetails?.fullName || 'N/A'}</p></div>
                                    <div><p className="text-[#2B3139] text-[10px] font-black uppercase tracking-widest mb-1">ID Number</p><p className="text-yellow-500 font-black">{selectedUser.kycDetails?.idNumber || 'N/A'}</p></div>
                                </div>
                                <div><p className="text-[#2B3139] text-[10px] font-black uppercase tracking-widest mb-1">Residential Address</p><p className="text-white font-bold leading-relaxed">{selectedUser.kycDetails?.address || 'N/A'}</p></div>
                            </div>
                            <div className="space-y-6">
                                <p className="text-[#2B3139] text-[10px] font-black uppercase tracking-widest mb-1">Uploaded Documents</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <img src={`http://localhost:5000${selectedUser.kycDetails?.idCardImage}`} className="w-full h-24 object-cover rounded-lg border border-[#2B3139]" alt="ID" />
                                    <img src={`http://localhost:5000${selectedUser.kycDetails?.selfieImage}`} className="w-full h-24 object-cover rounded-lg border border-[#2B3139]" alt="Selfie" />
                                </div>
                            </div>
                        </div>
                        {selectedUser.isVerified === 'Pending' && (
                            <div className="p-8 border-t border-[#2B3139] bg-[#0B0E11]/30 flex justify-end gap-4">
                                <button onClick={() => handleVerify(selectedUser._id, 'Unverified')} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-8 py-3 rounded-xl font-black text-xs uppercase transition">Reject</button>
                                <button onClick={() => handleVerify(selectedUser._id, 'Verified')} className="bg-green-500 hover:bg-green-600 text-black px-8 py-3 rounded-xl font-black text-xs uppercase transition">Approve Verification</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer Information */}
            <div className="mt-8 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                <p>System Status: Operational</p>
                <p>Admin Terminal Engine v2.0</p>
            </div>
        </div>
    );
}

export default Admin;