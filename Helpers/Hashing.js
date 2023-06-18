import bcrypt from 'bcrypt';

async function passwordHashing(password){
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt)
    return hashedPassword;
}
export {passwordHashing};

async function passwordComparing(password,hashedPassword){
    const result = await bcrypt.compare(password,hashedPassword);
    return result;
}
export {passwordComparing};