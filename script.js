(() => {
  const $ = (id) => document.getElementById(id);
  const voltage = $('voltage'), frequency = $('frequency'), resistance = $('resistance');
  const canvas = $('waveform'), ctx = canvas.getContext('2d');
  const diodeDrop = 0.7;
  const questions = [
    {q:'What is the primary function of a half-wave rectifier?',o:['Convert AC to pulsating DC','Convert DC to AC','Increase AC frequency','Regulate DC voltage'],a:0,e:'A single diode passes one half-cycle, producing unidirectional pulsating output.'},
    {q:'Which component performs the rectification?',o:['Resistor','Diode','Capacitor','Transformer'],a:1,e:'The diode conducts in forward bias and blocks in reverse bias.'},
    {q:'During the positive half-cycle (anode positive), an ideal diode is:',o:['Reverse biased','Forward biased','Open in both directions','In breakdown'],a:1,e:'The anode is positive relative to the cathode, so the diode is forward biased.'},
    {q:'What is the ideal output during the negative half-cycle?',o:['A negative half sine','A constant positive voltage','Approximately zero','Twice the input'],a:2,e:'The reverse-biased diode blocks current, leaving approximately zero voltage across the load.'},
    {q:'For an ideal half-wave rectifier, the average output is:',o:['Vm/2','Vm/π','2Vm/π','Vm/√2'],a:1,e:'The mean of a positive half sine over one full period is Vm/π.'},
    {q:'For an ideal half-wave rectifier, the RMS output is:',o:['Vm/2','Vm/π','Vm/√2','2Vm/π'],a:0,e:'The RMS value over a complete cycle with one conducting half-wave is Vm/2.'},
    {q:'The ideal peak inverse voltage of the diode is:',o:['Vm/2','2Vm','Vm','Vm/π'],a:2,e:'The reverse-biased diode must withstand the peak source voltage, Vm.'},
    {q:'What is the ideal ripple factor of a half-wave rectifier?',o:['0.482','1.21','0.406','π'],a:1,e:'Using Vrms/Vdc = π/2 gives r = √[(π/2)²−1] ≈ 1.21.'},
    {q:'What happens to the pulse spacing when input frequency increases?',o:['Pulses become farther apart','Pulses become closer together','Pulse height doubles','Output becomes negative'],a:1,e:'The output repeats once per input cycle, so a higher frequency means a shorter period.'},
    {q:'For a resistive load, load current is determined by:',o:['Vout × R','Vout/R','R/Vout','Frequency × R'],a:1,e:'Ohm’s law gives instantaneous load current as output voltage divided by load resistance.'}
  ];
  function makeQuiz(which) {
    const host = $(which + 'Quiz');
    host.innerHTML = questions.map((x,i)=>`<article class="question" data-index="${i}"><h3><span class="qnum">${String(i+1).padStart(2,'0')}</span>${x.q}</h3><div class="options">${x.o.map((v,j)=>`<label><input type="radio" name="${which}-${i}" value="${j}"> ${v}</label>`).join('')}</div><p class="explanation">${x.e}</p></article>`).join('');
  }
  makeQuiz('pre'); makeQuiz('post');
  document.querySelectorAll('[data-submit]').forEach(btn=>btn.addEventListener('click',()=>{
    const which=btn.dataset.submit, host=$(which+'Quiz'); let score=0, answered=0;
    host.classList.add('graded');
    host.querySelectorAll('.question').forEach((card,i)=>{
      card.classList.remove('correct','wrong');
      const selected=card.querySelector('input:checked');
      if(selected){answered++;if(Number(selected.value)===questions[i].a){score++;card.classList.add('correct')}else card.classList.add('wrong')}
      else card.classList.add('wrong');
    });
    $(which+'Result').textContent=`Score: ${score} / 10${answered<10?` · ${10-answered} unanswered`:''}`;
  }));
  function measurements() {
    const vm=Number(voltage.value), f=Number(frequency.value), r=Number(resistance.value), peak=Math.max(0,vm-diodeDrop);
    // Integrate one complete practical output cycle, including the silicon turn-on threshold.
    const n=4000; let sum=0,sumSq=0, max=0;
    for(let i=0;i<n;i++){const vin=vm*Math.sin(2*Math.PI*(i+.5)/n);const vout=vin>diodeDrop?vin-diodeDrop:0;sum+=vout;sumSq+=vout*vout;if(vout>max)max=vout;}
    const dc=sum/n,rms=Math.sqrt(sumSq/n),ac=Math.sqrt(Math.max(0,rms*rms-dc*dc));
    const ripple=dc>0?ac/dc:0,eff=rms>0?100*dc*dc/(rms*rms):0, idc=r*1000>0?dc/r*1000:0;
    $('voltageOut').value=vm.toFixed(vm%1?1:0);$('frequencyOut').value=f;$('resistanceOut').value=(r/1000).toFixed(1);
    $('mPeak').textContent=peak.toFixed(2);$('mDc').textContent=dc.toFixed(2);$('mRms').textContent=rms.toFixed(2);
    $('mRipple').textContent=peak.toFixed(2);$('mFactor').textContent=ripple.toFixed(2);$('mEfficiency').textContent=eff.toFixed(1);$('mPiv').textContent=vm.toFixed(2);$('mCurrent').textContent=idc.toFixed(2);
    $('theoryDc').textContent=`Theory: ${(peak/Math.PI).toFixed(2)} V`;$('theoryRms').textContent=`Theory: ${(peak/2).toFixed(2)} V`;
    draw(vm,peak,f); return {vm,f,r,peak,dc,rms,eff};
  }
  function draw(vm,peak,f) {
    const rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
    canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    const w=rect.width,h=rect.height,p={l:39,r:12,t:12,b:27},gw=w-p.l-p.r,gh=h-p.t-p.b;
    ctx.clearRect(0,0,w,h);ctx.font='10px DM Mono, monospace';ctx.lineWidth=1;
    const ymax=Math.ceil(Math.max(vm,1)/5)*5;
    for(let v=-ymax;v<=ymax;v+=ymax/2){const y=p.t+gh*(ymax-v)/(2*ymax);ctx.strokeStyle=v===0?'#aebdca':'#e8edf2';ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.stroke();ctx.fillStyle='#8293a2';ctx.fillText(v.toFixed(0),5,y+3)}
    for(let i=0;i<=4;i++){const x=p.l+gw*i/4;ctx.strokeStyle='#edf1f5';ctx.beginPath();ctx.moveTo(x,p.t);ctx.lineTo(x,p.t+gh);ctx.stroke();ctx.fillStyle='#8293a2';ctx.fillText((i*1000/f).toFixed(1),x-9,h-7)}
    function plot(color,fn,width){ctx.beginPath();for(let i=0;i<=360;i++){const a=2*Math.PI*i/360,x=p.l+gw*i/360,v=fn(a),y=p.t+gh*(ymax-v)/(2*ymax);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
    plot('#e7a938',a=>vm*Math.sin(a),2);plot('#159db8',a=>Math.max(0,vm*Math.sin(a)-diodeDrop),2.5);
    ctx.save();ctx.translate(13,p.t+gh/2);ctx.rotate(-Math.PI/2);ctx.fillStyle='#7d8e9e';ctx.fillText('Voltage (V)',0,0);ctx.restore();
  }
  [voltage,frequency,resistance].forEach(el=>el.addEventListener('input',measurements));
  $('addRow').addEventListener('click',()=>{const m=measurements(),body=$('observations');body.querySelector('.empty-row')?.remove();const row=body.insertRow();[body.rows.length,m.vm,m.f,(m.r/1000).toFixed(1),m.dc.toFixed(2),m.rms.toFixed(2),m.eff.toFixed(1)].forEach(v=>{const c=row.insertCell();c.textContent=v})});
  $('clearRows').addEventListener('click',()=>{$('observations').innerHTML='<tr class="empty-row"><td colspan="7">Adjust the controls, then add a reading.</td></tr>'});
  const sidebar=$('sidebar');$('menuToggle').addEventListener('click',()=>sidebar.classList.toggle('open'));
  sidebar.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{sidebar.classList.remove('open');sidebar.querySelectorAll('a').forEach(x=>x.classList.remove('active'));a.classList.add('active')}));
  const electron=$('electron');let phase=0;function animate(){phase=(phase+.018)%1;const conduction=Math.sin(phase*2*Math.PI)>diodeDrop/Math.max(1,Number(voltage.value));electron.style.opacity=conduction?'1':'.12';electron.setAttribute('cx',String(100+phase*380));requestAnimationFrame(animate)}
  window.addEventListener('resize',()=>draw(Number(voltage.value),Math.max(0,Number(voltage.value)-diodeDrop),Number(frequency.value)));
  measurements();animate();
})();
