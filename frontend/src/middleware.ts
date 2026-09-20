import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Phân quyền truy cập các route được bảo vệ
  const protectedRoutes = ['/admin', '/employer', '/candidate'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // 2. Nếu chưa đăng nhập, chuyển hướng về login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 3. Xác thực JWT bằng thư viện jose (chạy được trên Edge runtime)
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // 4. RBAC: Kiểm tra xem user có quyền vào route này không
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
    if (pathname.startsWith('/employer') && role !== 'employer') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
    if (pathname.startsWith('/candidate') && role !== 'candidate') {
      return NextResponse.redirect(new URL('/403', request.url));
    }

    // 5. Nếu hợp lệ, cho phép tiếp tục
    return NextResponse.next();
  } catch (error) {
    // Token không hợp lệ hoặc hết hạn
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    // Xóa cookie token lỗi
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('jwt_token');
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/employer/:path*', '/candidate/:path*'],
};
