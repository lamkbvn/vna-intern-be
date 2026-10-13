import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import { User, Gender } from '../../modules/users/user.entity.js';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
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
    {
      username: 'ryushiki12',
      passwordHash: hashedPassword,
      email: 'ryushiki12@gmail.com',
      fullName: 'Bang',
      gender: Gender.MALE,
      dateOfBirth: '2000-01-01',
    },
  ];

  for (const userData of users) {
    const existing = await userRepository.findOneBy({ email: userData.email });
    if (!existing) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`✅ Seeded user: ${userData.email}`);
    } else {
      console.log(`⏭️ User ${userData.email} already exists.`);
    }
  }

  console.log('✅ Users seeding process finished!');
}