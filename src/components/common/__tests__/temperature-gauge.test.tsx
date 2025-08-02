import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TemperatureGauge from '../temperature-gauge';

describe('TemperatureGauge', () => {
  it('should render with temperature value', () => {
    render(<TemperatureGauge temperature={20} />);
    
    // Should display the temperature value
    expect(screen.getByText('20.0°C')).toBeInTheDocument();
  });

  it('should render without temperature value when showValue is false', () => {
    render(<TemperatureGauge temperature={20} showValue={false} />);
    
    // Should not display the temperature value
    expect(screen.queryByText('20.0°C')).not.toBeInTheDocument();
  });

  it('should handle different temperature values', () => {
    const { rerender } = render(<TemperatureGauge temperature={5} />);
    expect(screen.getByText('5.0°C')).toBeInTheDocument();
    
    rerender(<TemperatureGauge temperature={25} />);
    expect(screen.getByText('25.0°C')).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    render(<TemperatureGauge temperature={20} size={200} />);
    
    // The component should render (no errors)
    expect(screen.getByText('20.0°C')).toBeInTheDocument();
  });

  it('should handle extreme temperatures', () => {
    render(<TemperatureGauge temperature={0} />);
    expect(screen.getByText('0.0°C')).toBeInTheDocument();
    
    render(<TemperatureGauge temperature={35} />);
    expect(screen.getByText('35.0°C')).toBeInTheDocument();
  });
}); 