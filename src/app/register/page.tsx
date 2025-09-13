'use client';

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo";

export default function RegisterPage() {
    const router = useRouter();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock register logic
        router.push('/dashboard');
    }

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
       <div className="flex items-center justify-center py-12">
        <Card className="mx-auto max-w-sm">
        <CardHeader>
            <div className="w-full flex justify-center mb-4">
                <Logo />
            </div>
            <CardTitle className="text-xl font-headline">Cadastro</CardTitle>
            <CardDescription>
            Crie sua conta para começar a gerenciar sua barbearia
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="full-name">Nome Completo</Label>
                <Input id="full-name" placeholder="John Doe" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
                Criar conta
            </Button>
            </form>
            <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <Link href="/" className="underline">
                Login
            </Link>
            </div>
        </CardContent>
        </Card>
      </div>
       <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/seed/barber-register/1920/1080"
          alt="Barbershop"
          data-ai-hint="barber tools"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.3]"
        />
      </div>
    </div>
  )
}
