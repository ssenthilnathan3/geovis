import { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"

const secret = process.env.NEXTAUTH_SECRET

export interface RequestProps {
    req: NextApiRequest
    res: NextApiResponse
}
export default async function handler({req, res}: RequestProps) {
  // if using `NEXTAUTH_SECRET` env variable, we detect it, and you won't actually need to `secret`
  // const token = await getToken({ req })
  const token = await getToken({ req, secret })
  console.log("JSON Web Token", token)
  res.end()
}