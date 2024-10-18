import { getSession, GetSessionParams } from 'next-auth/react'

export default function ProtectedPage() {
  return <div>This is a protected page. You can only see this if you're authenticated.</div>
}

export async function getServerSideProps(context: GetSessionParams | undefined) {
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
    }
  }

  return {
    props: { session },
  }
}