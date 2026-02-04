import { FiUser, FiMail, FiShield } from 'react-icons/fi';

export default function ProfileHeader({ user }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg p-5 text-white w-full'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2 text-white/80 text-sm'>
            <FiUser />
            Profile
          </div>
          <h1 className='mt-1 text-2xl sm:text-3xl font-semibold'>
            {user?.name ?? '—'}
          </h1>
        </div>

        <div className='grid sm:grid-cols-2 gap-3'>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-3'>
            <div className='flex items-center gap-2 text-xs text-white/70'>
              <FiMail />
              Email
            </div>
            <div className='mt-1 text-sm text-white/90 break-all'>
              {user?.email ?? '—'}
            </div>
          </div>

          <div className='rounded-2xl border border-white/10 bg-white/5 p-3'>
            <div className='flex items-center gap-2 text-xs text-white/70'>
              <FiShield />
              Role
            </div>
            <div className='mt-1 text-sm text-white/90'>
              {(user?.role ?? '—').toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
