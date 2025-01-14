import { NextResponse } from 'next/server';
import { RequestOptions, UserAppInformation } from './application.d';
import applications from './data.json';
import { config } from '@/config/Constants';
const BACKEND_URL = config.url.BACKEND_API_URL;

import { cookies } from "next/headers";

export async function GET(request: Request): Promise<NextResponse> {
  let applicationJSON;

  const login_cookie = cookies().get("ods_login_cookie_nomnom")
  if (login_cookie === undefined) {
    // this happens when, somehow, they're here yet they don't have
    // a login cookie :)
    return new NextResponse();
  }

  try {
    const res = await fetch(`${BACKEND_URL}/applications/`, {
      cache: 'no-store',
      headers: {
        Cookie: `${login_cookie.name}=${login_cookie.value}`
      },
    });
    applicationJSON = await res.json();
  } catch (error) {
    console.error(error);
    return new NextResponse();
  }
  return NextResponse.json(applicationJSON);
}

export async function POST(request: Request): Promise<NextResponse> {
  const login_cookie = cookies().get("ods_login_cookie_nomnom")
  if (login_cookie === undefined) {
    // this happens when, somehow, they're here yet they don't have
    // a login cookie :)
    return new NextResponse();
  }
  const options: RequestOptions | any = {
    method: 'POST',
    duplex: 'half',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include',
      Cookie: `${login_cookie.name}=${login_cookie.value}`
    },
    body: request.body,
    cache: 'no-store',
  };
  const res = await fetch(`${BACKEND_URL}/applications/`, options);
  const data = await res.json();
  console.log(data);
  return NextResponse.json(data);
}

async function parsePotentialJSON(res: Response) {
  try {
    return await res.json();
  } catch (error) {
    return res.body;
  }
}
