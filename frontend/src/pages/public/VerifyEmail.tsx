import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;
      try {
        const { data } = await axios.get(`${API_URL}/auth/verify/${token}`);
        setStatus('success');
        setMessage(data.message);
      } catch (err: unknown) {
        setStatus('error');
        const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Verifikasi gagal';
        setMessage(msg || 'Verifikasi gagal');
      }
    };

    if (token) verifyEmail();
  }, [token]);

  return (
    <div className="py-16 sm:py-24 flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {status === 'loading' && (
            <>
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Memverifikasi akun Anda...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-black mb-2">Berhasil!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
              >
                Masuk Sekarang
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-black mb-2">Gagal</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link
                to="/register"
                className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
              >
                Daftar Ulang
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
