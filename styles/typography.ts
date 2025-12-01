import { StyleSheet } from 'react-native';
import { ThemeColors } from '@/hooks/ThemeContext';

export const createTypography = (colors: ThemeColors) => StyleSheet.create({
  // Headings
  heading: {
    fontSize: 24,
    fontFamily: colors.fontFamily.bold, // Use Poppins-Bold for headings
    lineHeight: 32,
  },
  subheading: {
    fontSize: 20,
    fontFamily: colors.fontFamily.semiBold, // Use Poppins-SemiBold for subheadings
    lineHeight: 28,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontFamily: colors.fontFamily.regular, // Use Poppins-Regular for body text
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontFamily: colors.fontFamily.bold, // Use Poppins-Bold for bold body text
    lineHeight: 24,
  },
  
  // Section titles
  sectionTitle: {
    fontSize: 18,
    fontFamily: colors.fontFamily.semiBold, // Use Poppins-SemiBold for section titles
    lineHeight: 24,
  },
  
  // Card typography
  cardTitle: {
    fontSize: 16,
    fontFamily: colors.fontFamily.semiBold, // Use Poppins-SemiBold for card titles
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: colors.fontFamily.regular, // Use Poppins-Regular for card subtitles
    lineHeight: 20,
  },
  
  // Labels and small text
  label: {
    fontSize: 14,
    fontFamily: colors.fontFamily.medium, // Use Poppins-Medium for labels
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontFamily: colors.fontFamily.regular, // Use Poppins-Regular for small text
    lineHeight: 16,
  },
  tiny: {
    fontSize: 10,
    fontFamily: colors.fontFamily.medium, // Use Poppins-Medium for tiny text
    lineHeight: 14,
  },
  
  // Time display
  time: {
    fontSize: 14,
    fontFamily: colors.fontFamily.regular, // Use Poppins-Regular for time display
    lineHeight: 20,
  },
  
  // Date display
  dateNumber: {
    fontSize: 18,
    fontFamily: colors.fontFamily.semiBold, // Use Poppins-SemiBold for date numbers
    lineHeight: 22,
  },
  
  // Button text
  buttonText: {
    fontSize: 14,
    color: colors.error, // Assuming error color is used for button text as in original
    fontFamily: colors.fontFamily.medium, // Use Poppins-Medium for button text
    lineHeight: 20,
  },
});