/**
 * Utility functions for generating avatar URLs using DiceBear
 * https://www.dicebear.com/styles
 */

const AVATAR_STYLES = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'bottts',
  'fun-emoji',
  'icons',
  'identicon',
  'initials',
  'lorelei',
  'micah',
  'miniavs',
  'personas',
  'pixel-art',
] as const;

type AvatarStyle = typeof AVATAR_STYLES[number];

interface AvatarOptions {
  size?: number;
  backgroundColor?: string;
  style?: AvatarStyle;
}

/**
 * Generates a DiceBear avatar URL for the given seed
 * @param seed - String to generate avatar from (e.g. email, username)
 * @param options - Avatar customization options
 * @returns URL string for the avatar image
 */
export const generateAvatarUrl = (
  seed: string,
  options: AvatarOptions = {}
): string => {
  const {
    size = 128,
    backgroundColor,
    style = 'avataaars'
  } = options;

  const baseUrl = 'https://api.dicebear.com/7.x';
  const params = new URLSearchParams({
    seed,
    size: size.toString(),
    ...(backgroundColor ? { backgroundColor } : {})
  });

  return `${baseUrl}/${style}/svg?${params.toString()}`;
};
