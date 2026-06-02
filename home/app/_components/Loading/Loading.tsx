const Loading = () => {
  return (
    <div id="preloader" role="status" aria-label="Yükleniyor">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
    </div>
  );
};

export default Loading;
