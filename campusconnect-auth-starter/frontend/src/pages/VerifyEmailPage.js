import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/authApi';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    const token = searchParams.get('token');
    api.get(`/verify-email?token=${token}`)
      .then((response) => setMessage(response.data.message))
      .catch((err) => setMessage(err.response?.data?.message || 'Verification failed.'));
  }, [searchParams]);

  return <div style={{ padding: 40, fontFamily: 'Arial' }}><h2>{message}</h2></div>;
}
