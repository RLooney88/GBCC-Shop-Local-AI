import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UserFormProps {
  onChatStart: (chatId: number) => void;
}

export function UserForm({ onChatStart }: UserFormProps) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      email: ""
    }
  });

  const startChat = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const res = await apiRequest("POST", "/api/chat/start", data);
      return res.json();
    },
    onSuccess: (data) => {
      onChatStart(data.chatId);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => startChat.mutate(data))} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-[#00A7B7] hover:bg-[#008A99]"
          disabled={startChat.isPending}
        >
          {startChat.isPending ? "Starting Chat..." : "Start Chat"}
        </Button>
      </form>
    </Form>
  );
}