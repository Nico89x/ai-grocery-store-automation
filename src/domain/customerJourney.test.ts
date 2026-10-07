import { expect,it } from 'vitest';
import { customerPosition,customerRoute,phaseDuration,walkingSpeed } from './customerJourney';
import type { Customer } from './simulation';
const person:Customer={id:1,productId:'soda',phase:'entering',elapsed:0,color:'#6b8f83'};
it('walks through the narrow entrance and avoids the checkout counter',()=>{
  for(const phase of ['entering','to-checkout','leaving'] as const){const duration=phaseDuration(person,phase),route=customerRoute(person,phase);
    expect(customerPosition({...person,phase,elapsed:0})).toEqual(route[0]);
    expect(customerPosition({...person,phase,elapsed:duration+.01})).toEqual(route.at(-1));
    for(let t=0;t<=duration;t+=.05){const [x,,z]=customerPosition({...person,phase,elapsed:t});
      expect(x>-.4&&x<3.3&&z>-3.95&&z<-2.7).toBe(false);
      if(z>5.5&&z<6.15)expect(Math.abs(x)).toBeLessThan(.95);}
  }
});
it('keeps movement within a plausible walking speed and stops at the shelf',()=>{
  const duration=phaseDuration(person,'entering');
  for(let t=0;t<duration;t+=.1){const a=customerPosition({...person,elapsed:t}),b=customerPosition({...person,elapsed:t+.1});
    expect(Math.hypot(b[0]-a[0],b[2]-a[2])).toBeLessThanOrEqual(walkingSpeed(person)*.1+1e-7);}
  expect(customerPosition({...person,phase:'browsing',elapsed:0})).toEqual(customerPosition({...person,phase:'browsing',elapsed:4}));
});
