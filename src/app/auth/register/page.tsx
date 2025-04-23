import RegisterForm from '../../components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-love-100 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center mb-8">
          <h1 className="text-3xl font-bold text-love-600">恋爱待办清单</h1>
          <p className="text-gray-600 mt-2">创建您的账号以开始管理爱情待办事项</p>
        </div>
        
        <RegisterForm />
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            已有账号? {' '}
            <Link href="/auth/login" className="text-love-600 hover:underline">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 