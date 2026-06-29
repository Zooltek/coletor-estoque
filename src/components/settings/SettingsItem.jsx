import React from 'react';

export function SettingsItem({ label, description, type, value, onChange, options = [] }) {
  return (
    <div className="settings-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="settings-item-text" style={{ flex: 1, paddingRight: '15px' }}>
        <div style={{ fontWeight: '600', fontSize: '15px' }}>{label}</div>
        {description && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{description}</div>}
      </div>
      
      <div className="settings-item-control">
        {type === 'switch' && (
          <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
            <input 
              type="checkbox" 
              checked={value} 
              onChange={(e) => onChange(e.target.checked)} 
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span className="slider round" style={{ 
              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
              backgroundColor: value ? '#4CAF50' : '#ccc', transition: '.4s', borderRadius: '34px' 
            }}>
              <span style={{
                position: 'absolute', content: '""', height: '16px', width: '16px', left: value ? '20px' : '4px', bottom: '4px',
                backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
              }}/>
            </span>
          </label>
        )}

        {type === 'select' && (
          <select 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            {options.map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        {type === 'number' && (
          <input 
            type="number" 
            value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            style={{ width: '60px', padding: '6px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}
          />
        )}
      </div>
    </div>
  );
}
