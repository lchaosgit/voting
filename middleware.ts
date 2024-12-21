import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 重定向根路径到home
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url))
  }
  
  // 如果未连接钱包但访问profile，重定向到home
  if (request.nextUrl.pathname === '/profile' && !request.cookies.get('wallet_connected')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/profile']
}