import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import { User, Gender } from '../../modules/users/user.entity.js';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const existingUser = await userRepository.findOneBy({ email: 'admin@example.com' });
  if (existingUser) {
    console.log('⏭️ Users already seeded. Skipping...');
    return;
  }

  const hashedPassword = await bcrypt.hash('123456', 10);

  const users = [
    {
      username: 'admin',
      passwordHash: hashedPassword,
      email: 'admin@example.com',
      fullName: 'System Administrator',
      gender: Gender.MALE,
      dateOfBirth: '1990-01-01',
    },
    {
      username: 'johndoe',
      passwordHash: hashedPassword,
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      gender: Gender.MALE,
      dateOfBirth: '1995-05-15',
    },
  ];

  for (const userData of users) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
  }

  console.log('✅ Users seeded successfully!');
}