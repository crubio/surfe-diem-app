import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TemperatureCard from '../temperature-card';

describe('TemperatureCard', () => {
  it('should render with temperature value in Fahrenheit by default', () => {
    render(<TemperatureCard temperature={20} />);
    
    // Should display the temperature value in Fahrenheit (68.0°F)
    expect(screen.getByText('68.0°F')).toBeInTheDocument();
    // Should also show Celsius
    expect(screen.getByText(/20\.0°C/)).toBeInTheDocument();
  });

  it('should render with temperature value in Celsius when showFahrenheit is false', () => {
    render(<TemperatureCard temperature={20} showFahrenheit={false} />);
    
    // Should display the temperature value in Celsius
    expect(screen.getByText('20.0°C')).toBeInTheDocument();
    // Should also show Fahrenheit
    expect(screen.getByText(/68\.0°F/)).toBeInTheDocument();
  });

  it('should show comfort level by default', () => {
    render(<TemperatureCard temperature={20} />);
    
    // Should display comfort level (Rash Guard for 20°C)
    expect(screen.getByText(/Rash Guard/)).toBeInTheDocument();
  });

  it('should hide comfort level when showComfortLevel is false', () => {
    render(<TemperatureCard temperature={20} showComfortLevel={false} />);
    
    // Should not display comfort level
    expect(screen.queryByText(/Rash Guard/)).not.toBeInTheDocument();
  });

  it('should display quality description chip', () => {
    render(<TemperatureCard temperature={20} />);
    
    // Should display quality description (Warm for 20°C)
    expect(screen.getByText('Warm')).toBeInTheDocument();
  });

  it('should handle different temperature values', () => {
    const { rerender } = render(<TemperatureCard temperature={5} />);
    expect(screen.getByText('41.0°F')).toBeInTheDocument();
    expect(screen.getByText('Very Cold')).toBeInTheDocument();
    
    rerender(<TemperatureCard temperature={25} />);
    expect(screen.getByText('77.0°F')).toBeInTheDocument();
    expect(screen.getByText('Very Warm')).toBeInTheDocument();
  });

  it('should handle extreme temperatures', () => {
    render(<TemperatureCard temperature={0} />);
    expect(screen.getByText('32.0°F')).toBeInTheDocument();
    
    render(<TemperatureCard temperature={35} />);
    expect(screen.getByText('95.0°F')).toBeInTheDocument();
  });
}); 