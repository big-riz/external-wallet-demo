import { CreateWalletForm } from './components/CreateWalletForm'

export default function AppCreatedWalletPage() {
  return (
    <div className="container mx-auto p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">App Created Wallet</h1>
      <CreateWalletForm 
        appName="Defi" 
        imageUrl="https://res.cloudinary.com/hn8pdtayf/image/upload/v1574942466/round-handcash-logo_cj47fp.png" 
      />
    </div>
  )
}