import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-love-100 to-white flex flex-col justify-center items-center p-4">
      <div className="text-6xl mb-6">💔</div>
      <h1 className="text-3xl font-bold text-love-600 mb-4">页面未找到</h1>
      <p className="text-gray-600 mb-8 text-center">
        我们似乎迷失了方向，但爱的旅程总会有新的道路。
      </p>
      <Link href="/" className="btn btn-primary bg-love-500 hover:bg-love-600 border-none">
        返回首页
      </Link>
    </div>
  );
} 