import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';

export default function OfficerLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = mobile, 2 = docs
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [govIdFile, setGovIdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    if (mobile.length < 10) {
      setError('Enter valid mobile number');
      return;
    }
    setError('');
    // simulate OTP request
    setStep(2);
  };

  const handleVerify = async () => {
    if (!aadhaar || !govIdFile) {
      setError('Fill all fields and upload ID');
      return;
    }
    const formData = new FormData();
    formData.append('mobile', mobile);
    formData.append('otp', otp);
    formData.append('aadhaar', aadhaar);
    formData.append('govId', govIdFile);

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/officer/verify', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        navigate('/official-view');
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl mt-8">
        <h1 className="text-xl font-bold mb-4 text-center">Officer Login / Verification</h1>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
                placeholder="e.g. 9876543210"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
                placeholder="Enter OTP"
              />
              <button
                onClick={sendOtp}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                {otp ? 'Resend' : 'Send'} OTP
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
              <input
                type="text"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-red-500 focus:border-red-500"
                placeholder="XXXX XXXX XXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Govt ID Card</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setGovIdFile(e.target.files[0])}
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        )}

        {error && <p className="text-red-600 text-sm mt-3 text-center">{error}</p>}
      </div>
    </div>
  );
}
