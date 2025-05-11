import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
  // Headings
  heading: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  subheading: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  
  // Section titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  
  // Card typography
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  
  // Labels and small text
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  tiny: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
  
  // Time display
  time: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  
  // Date display
  dateNumber: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  
  // Button text
  buttonText: {
    fontSize: 14,
    color: '#EF4045',
    fontWeight: '500',
    lineHeight: 20,
  },
});