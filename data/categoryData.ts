import { Category } from '@/types/category';
import { colors } from '@/styles/colors';

export const categories: Category[] = [
  {
    id: 'cat1',
    name: 'Gardening',
    taskCount: 2,
    color: colors.categoryPeach,
    image: 'https://images.pexels.com/photos/1105019/pexels-photo-1105019.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'cat2',
    name: 'Mobile App',
    taskCount: 5,
    color: colors.categoryMint,
    image: 'https://images.pexels.com/photos/3345882/pexels-photo-3345882.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'cat3',
    name: 'Website',
    taskCount: 3,
    color: colors.categoryLavender,
    image: 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'cat4',
    name: 'Finance',
    taskCount: 4,
    color: colors.categoryBlue,
    image: 'https://images.pexels.com/photos/3943723/pexels-photo-3943723.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
];