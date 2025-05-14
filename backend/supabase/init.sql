CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    balance DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'bill', 'recharge')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION add_funds_and_log(
    amount_to_add DECIMAL,
    description_text TEXT DEFAULT 'Added funds'
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_balance DECIMAL;
BEGIN
   
    UPDATE profiles
    SET balance = balance + amount_to_add,
        updated_at = NOW()
    WHERE id = auth.uid()
    RETURNING balance INTO new_balance;

   
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        description,
        status
    ) VALUES (
        auth.uid(),
        'income',
        amount_to_add,
        description_text,
        'completed'
    );

    RETURN new_balance;
END;
$$; 