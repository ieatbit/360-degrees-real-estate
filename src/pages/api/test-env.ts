import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Read environment variables - hide the actual password for security
  const adminUsername = process.env.ADMIN_USERNAME || 'default_admin';
  
  // Return status of environment variables
  res.status(200).json({
    envAvailable: !!process.env.ADMIN_USERNAME,
    username: adminUsername,
    passwordSet: !!process.env.ADMIN_PASSWORD,
    nodeEnv: process.env.NODE_ENV
  });
} 