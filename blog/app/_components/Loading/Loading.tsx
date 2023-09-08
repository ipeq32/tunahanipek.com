const Loading = () => {
  return (
    <main className='flex flex-col justify-center items-center w-full h-screen bg-primary/90'>
      <div className="flex justify-center items-center">
        <span className="w-4 h-4 my-12 mx-1 bg-gray-500 rounded-full animate-loader" />
        <span className="w-4 h-4 my-12 mx-1 bg-gray-500 rounded-full animate-loader [animation-delay:0.2s]" />
        <span className="w-4 h-4 my-12 mx-1 bg-gray-500 rounded-full animate-loader [animation-delay:0.4s]" />
      </div>
      <h1 className="text-4xl text-cyan-600 font-semibold">TUNAHAN İPEK</h1>
    </main>
  )
};

export default Loading;