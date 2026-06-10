export default function ComingSoon({ title = 'Coming soon' }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <p className="mt-2 text-slate-500">This module will be built in an upcoming week.</p>
    </div>
  );
}
