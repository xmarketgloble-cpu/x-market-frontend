import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile({ user, setUser }) {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  
  const [dob, setDob] = useState('');
  // 🌍 Default to US
  const [countryCode, setCountryCode] = useState({ code: '+1', country: 'us', name: 'United States' }); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');

  const [searchCountry, setSearchCountry] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // 🌍 နိုင်ငံ ၅၀ ကျော် (Asia အားလုံး + နာမည်ကြီး နိုင်ငံများ)
  const countries = [
    // --- North America ---
    { code: '+1', country: 'us', name: 'United States' },
    { code: '+1', country: 'ca', name: 'Canada' },
    { code: '+52', country: 'mx', name: 'Mexico' },
    
    // --- Asia ---
    { code: '+95', country: 'mm', name: 'Myanmar' },
    { code: '+66', country: 'th', name: 'Thailand' },
    { code: '+65', country: 'sg', name: 'Singapore' },
    { code: '+81', country: 'jp', name: 'Japan' },
    { code: '+82', country: 'kr', name: 'South Korea' },
    { code: '+86', country: 'cn', name: 'China' },
    { code: '+852', country: 'hk', name: 'Hong Kong' },
    { code: '+886', country: 'tw', name: 'Taiwan' },
    { code: '+84', country: 'vn', name: 'Vietnam' },
    { code: '+60', country: 'my', name: 'Malaysia' },
    { code: '+62', country: 'id', name: 'Indonesia' },
    { code: '+63', country: 'ph', name: 'Philippines' },
    { code: '+91', country: 'in', name: 'India' },
    { code: '+94', country: 'lk', name: 'Sri Lanka' },
    { code: '+880', country: 'bd', name: 'Bangladesh' },
    { code: '+92', country: 'pk', name: 'Pakistan' },
    { code: '+977', country: 'np', name: 'Nepal' },
    { code: '+975', country: 'bt', name: 'Bhutan' },
    { code: '+960', country: 'mv', name: 'Maldives' },
    { code: '+93', country: 'af', name: 'Afghanistan' },
    { code: '+98', country: 'ir', name: 'Iran' },
    { code: '+964', country: 'iq', name: 'Iraq' },
    { code: '+966', country: 'sa', name: 'Saudi Arabia' },
    { code: '+971', country: 'ae', name: 'United Arab Emirates' },
    { code: '+972', country: 'il', name: 'Israel' },
    { code: '+973', country: 'bh', name: 'Bahrain' },
    { code: '+974', country: 'qa', name: 'Qatar' },
    { code: '+965', country: 'kw', name: 'Kuwait' },
    { code: '+968', country: 'om', name: 'Oman' },
    { code: '+962', country: 'jo', name: 'Jordan' },
    { code: '+961', country: 'lb', name: 'Lebanon' },
    { code: '+963', country: 'sy', name: 'Syria' },
    { code: '+967', country: 'ye', name: 'Yemen' },
    { code: '+855', country: 'kh', name: 'Cambodia' },
    { code: '+856', country: 'la', name: 'Laos' },
    { code: '+673', country: 'bn', name: 'Brunei' },
    { code: '+670', country: 'tl', name: 'East Timor' },
    { code: '+976', country: 'mn', name: 'Mongolia' },
    { code: '+7', country: 'kz', name: 'Kazakhstan' },
    { code: '+998', country: 'uz', name: 'Uzbekistan' },
    { code: '+996', country: 'kg', name: 'Kyrgyzstan' },
    
    // --- Europe ---
    { code: '+44', country: 'gb', name: 'United Kingdom' },
    { code: '+49', country: 'de', name: 'Germany' },
    { code: '+33', country: 'fr', name: 'France' },
    { code: '+39', country: 'it', name: 'Italy' },
    { code: '+34', country: 'es', name: 'Spain' },
    { code: '+41', country: 'ch', name: 'Switzerland' },
    { code: '+31', country: 'nl', name: 'Netherlands' },
    { code: '+46', country: 'se', name: 'Sweden' },
    { code: '+47', country: 'se', name: 'Norway' },
    { code: '+7', country: 'ru', name: 'Russia' },
    { code: '+380', country: 'ua', name: 'Ukraine' },

    // --- Oceania ---
    { code: '+61', country: 'au', name: 'Australia' },
    { code: '+64', country: 'nz', name: 'New Zealand' },

    // --- South America ---
    { code: '+55', country: 'br', name: 'Brazil' },
    { code: '+54', country: 'ar', name: 'Argentina' },
    { code: '+57', country: 'co', name: 'Colombia' },
    { code: '+56', country: 'cl', name: 'Chile' },

    // --- Africa ---
    { code: '+27', country: 'za', name: 'South Africa' },
    { code: '+234', country: 'ng', name: 'Nigeria' },
    { code: '+20', country: 'eg', name: 'Egypt' },
    { code: '+254', country: 'ke', name: 'Kenya' }
  ];

  // ရှာဖွေမှုအတွက် (နာမည် သို့မဟုတ် ကုဒ်)
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchCountry.toLowerCase()) || 
    c.code.includes(searchCountry)
  );

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'front') {
        setIdFront(file);
        setFrontPreview(URL.createObjectURL(file));
      } else if (type === 'back') {
        setIdBack(file);
        setBackPreview(URL.createObjectURL(file));
      }
    }
  };

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStream(stream);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Unable to access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setSelfie(file);
        setSelfiePreview(URL.createObjectURL(file));
      }, 'image/jpeg');

      closeCamera();
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleSubmitKYC = async (e) => {
    e.preventDefault();
    if (!idFront || !idBack || !selfie) {
      return alert("Please upload ALL documents: Front ID, Back ID, and Face Selfie!");
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('idNumber', idNumber);
    formData.append('dob', dob);
    formData.append('phoneNumber', `${countryCode.code} ${phoneNumber}`);
    formData.append('gender', gender);
    formData.append('address', address);
    formData.append('idFront', idFront); 
    formData.append('idBack', idBack);   
    formData.append('selfie', selfie);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/user/submit-kyc', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      alert(res.data.message);
      setUser({ ...user, isVerified: 'Pending' });
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || "Verification Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12 relative">
      <div className="bg-[#1E2329] rounded-3xl border border-[#2B3139] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-[#2B3139] bg-[#0B0E11]/50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Identity Verification (KYC)</h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Submit documents to access all features</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
            user?.isVerified === 'Verified' ? 'bg-green-500/20 text-green-500' : 
            user?.isVerified === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
          }`}>
            {user?.isVerified || 'Unverified'}
          </span>
        </div>

        <form onSubmit={handleSubmitKYC} className="p-8 space-y-8">
          {user?.isVerified === 'Unverified' && user?.kycDetails?.rejectReason && (
            <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="bg-red-500/20 p-2 rounded-lg text-red-500 text-xl">⚠️</div>
                <div>
                  <h4 className="text-red-500 text-xs font-black uppercase tracking-widest mb-1">Verification Unsuccessful</h4>
                  <p className="text-gray-300 text-sm font-bold leading-relaxed">{user.kycDetails.rejectReason}</p>
                </div>
              </div>
            </div>
          )}

          {user?.isVerified === 'Verified' ? (
             <div className="text-center py-20">
               <h3 className="text-2xl font-black text-white uppercase">Terminal Access Authorized</h3>
             </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Full Name (As per ID)</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Full ID Name" className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-xl px-5 py-4 text-white focus:border-yellow-500 outline-none" />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">ID Card / Passport Number</label>
                  <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required placeholder="Enter unique ID number" className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-xl px-5 py-4 text-white focus:border-yellow-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* 🔥 Custom Phone Number Dropdown with Image Flags */}
                <div className="relative">
                  <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Phone Number</label>
                  <div className="flex w-full bg-[#0B0E11] border border-[#2B3139] rounded-xl overflow-visible focus-within:border-yellow-500 transition shadow-inner">
                    <button 
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="bg-[#1E2329] text-white px-3 py-4 outline-none border-r border-[#2B3139] cursor-pointer text-xs font-bold flex items-center gap-2 whitespace-nowrap min-w-[100px] justify-center hover:bg-[#2B3139] transition"
                    >
                      <img src={`https://flagcdn.com/w40/${countryCode.country}.png`} alt={countryCode.name} className="w-5 h-auto rounded-sm object-cover" />
                      {countryCode.code}
                    </button>
                    <input 
                      type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required
                      placeholder="9 123 456 789"
                      className="w-full bg-transparent px-4 py-4 text-white outline-none"
                    />
                  </div>
                  
                  {/* Searchable Dropdown List */}
                  {showCountryDropdown && (
                    <>
                      {/* Click outside to close */}
                      <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)}></div>
                      
                      <div className="absolute z-50 top-[75px] left-0 w-72 bg-[#1E2329] border border-[#2B3139] rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                        <div className="p-3 sticky top-0 bg-[#1E2329] border-b border-[#2B3139] z-10">
                          <input 
                            type="text" placeholder="Search country name or code..." 
                            value={searchCountry} onChange={(e) => setSearchCountry(e.target.value)}
                            className="w-full bg-[#0B0E11] text-white px-4 py-2.5 rounded-lg text-xs font-bold outline-none focus:border-yellow-500 border border-[#2B3139]"
                            autoFocus
                          />
                        </div>
                        <ul className="py-1">
                          {filteredCountries.length > 0 ? filteredCountries.map((c, i) => (
                            <li 
                              key={i} 
                              onClick={() => { setCountryCode(c); setShowCountryDropdown(false); setSearchCountry(''); }}
                              className="px-4 py-2.5 text-white text-xs hover:bg-[#2B3139] cursor-pointer flex gap-3 items-center transition-colors"
                            >
                              <img src={`https://flagcdn.com/w40/${c.country}.png`} alt={c.name} className="w-5 h-auto rounded-sm object-cover shadow-sm" />
                              <span className="font-bold flex-1 truncate">{c.name}</span>
                              <span className="text-gray-400 font-medium">{c.code}</span>
                            </li>
                          )) : (
                            <li className="px-4 py-4 text-center text-xs text-gray-500 font-bold uppercase tracking-widest">No country found</li>
                          )}
                        </ul>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Date of Birth</label>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-xl px-5 py-4 text-white focus:border-yellow-500 outline-none [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} required className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-xl px-5 py-4 text-white focus:border-yellow-500 outline-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Residential Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Enter your full residential address..." rows="3" className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-xl px-5 py-4 text-white focus:border-yellow-500 outline-none resize-none"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest">ID Document (Front)</label>
                  <div className="relative group overflow-hidden rounded-2xl">
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required />
                    <div className={`border-2 border-dashed ${frontPreview ? 'border-yellow-500/30' : 'border-[#2B3139]'} bg-[#0B0E11] rounded-2xl p-8 text-center`}>
                      {frontPreview ? <img src={frontPreview} className="max-h-40 mx-auto rounded-lg" /> : <div className="py-4"><span className="text-3xl block mb-2">🆔</span><p className="text-[10px] text-gray-500">Upload Front View</p></div>}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest">ID Document (Back)</label>
                  <div className="relative group overflow-hidden rounded-2xl">
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required />
                    <div className={`border-2 border-dashed ${backPreview ? 'border-yellow-500/30' : 'border-[#2B3139]'} bg-[#0B0E11] rounded-2xl p-8 text-center`}>
                      {backPreview ? <img src={backPreview} className="max-h-40 mx-auto rounded-lg" /> : <div className="py-4"><span className="text-3xl block mb-2">💳</span><p className="text-[10px] text-gray-500">Upload Back View</p></div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest">Face Selfie with ID Card</label>
                
                <div className={`border-2 border-dashed ${selfiePreview ? 'border-yellow-500/30' : 'border-[#2B3139]'} bg-[#0B0E11] rounded-2xl overflow-hidden relative text-center min-h-[250px] flex items-center justify-center`}>
                  
                  {!isCameraOpen && selfiePreview && (
                    <div className="p-4 w-full">
                      <img src={selfiePreview} alt="Selfie" className="max-h-56 mx-auto rounded-lg border-2 border-yellow-500/20" />
                      <button type="button" onClick={() => { setSelfie(null); setSelfiePreview(null); }} className="mt-4 text-xs text-red-500 font-bold uppercase hover:underline">Retake Photo</button>
                    </div>
                  )}

                  {!isCameraOpen && !selfiePreview && (
                    <button type="button" onClick={openCamera} className="w-full h-full p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-[#2B3139]/50 transition">
                      <span className="text-4xl block mb-3">🤳</span>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-relaxed">
                        Click here to open camera <br /> Hold your ID Card next to your face
                      </p>
                    </button>
                  )}

                  {isCameraOpen && (
                    <div className="absolute inset-0 bg-black z-20 flex flex-col">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
                        <button type="button" onClick={closeCamera} className="bg-red-500 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase shadow-xl hover:bg-red-600 transition">Cancel</button>
                        <button type="button" onClick={capturePhoto} className="bg-white text-black px-8 py-2.5 rounded-full text-xs font-black uppercase shadow-[0_0_20px_rgba(255,255,255,0.5)] border-4 border-yellow-500 hover:scale-105 transition">Capture</button>
                      </div>
                    </div>
                  )}
                  
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || user?.isVerified === 'Pending'} className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 disabled:opacity-50 text-black font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-[0.2em] text-xs mt-4 active:scale-[0.98]">
                {isSubmitting ? 'Uploading Data...' : 'Authorize Identity'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default Profile;