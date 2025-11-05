// const User = require('../models/user');
// const jwt = require('jsonwebtoken');

// class AuthController {
//     static async adminLogin(req, res) {
//         try {
//             const { username, password } = req.body;

//             if (!username || !password) {
//                 return res.status(400).json({ error: 'Username and password are required' });
//             }

//             // Find user by username or email
//             let user = await User.findByUsername(username);
//             if (!user) {
//                 user = await User.findByEmail(username);
//             }

//             if (!user) {
//                 return res.status(401).json({ error: 'Invalid credentials' });
//             }

//             // Check if user is admin
//             if (!['admin', 'super_admin'].includes(user.role)) {
//                 return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
//             }

//             // Verify password
//             const isValidPassword = await User.verifyPassword(password, user.password);
//             if (!isValidPassword) {
//                 return res.status(401).json({ error: 'Invalid credentials' });
//             }

//             // Generate token
//             const token = jwt.sign(
//                 { 
//                     userId: user.id, 
//                     username: user.username,
//                     role: user.role 
//                 },
//                 process.env.JWT_SECRET || 'your-secret-key',
//                 { expiresIn: '24h' }
//             );

//             res.json({
//                 message: 'Login successful',
//                 token,
//                 user: {
//                     id: user.id,
//                     username: user.username,
//                     email: user.email,
//                     role: user.role,
//                     name: user.name
//                 }
//             });

//         } catch (error) {
//             console.error('Admin login error:', error);
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     }

//     static async getProfile(req, res) {
//         try {
//             res.json({
//                 user: req.user
//             });
//         } catch (error) {
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     }
// }

// module.exports = AuthController;



// const User = require('../models/user');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt'); // Add this import

// class AuthController {
//     static async adminLogin(req, res) {
//         try {
//             const { username, password } = req.body;

//             console.log('🔐 Admin login attempt:', { username });

//             if (!username || !password) {
//                 console.log('❌ Missing credentials');
//                 return res.status(400).json({ error: 'Username and password are required' });
//             }

//             // Find user by username or email
//             console.log('🔍 Searching for user by username:', username);
//             let user = await User.findByUsername(username);
            
//             if (!user) {
//                 console.log('🔍 User not found by username, trying email:', username);
//                 user = await User.findByEmail(username);
//             }

//             if (!user) {
//                 console.log('❌ User not found with username/email:', username);
//                 return res.status(401).json({ error: 'Invalid credentials' });
//             }

//             console.log('✅ User found:', { 
//                 id: user.id, 
//                 username: user.username, 
//                 email: user.email, 
//                 role: user.role 
//             });

//             // Check if user is admin
//             if (!['admin', 'super_admin'].includes(user.role)) {
//                 console.log('❌ User is not admin. Role:', user.role);
//                 return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
//             }

//             console.log('🔑 Verifying password...');
//             console.log('Input password:', password); // Debug the actual input
//             console.log('User has password hash:', !!user.password);
//             console.log('Password hash length:', user.password?.length);
//             console.log('Password hash (first 20 chars):', user.password?.substring(0, 20));

//             // ✅ FIX: Use bcrypt directly for better debugging
//             const isValidPassword = await bcrypt.compare(password, user.password);
//             console.log('Password verification result:', isValidPassword);

//             if (!isValidPassword) {
//                 console.log('❌ Invalid password for user:', user.username);
                
//                 // Additional debug: Test what happens with a known password
//                 const testHash = await bcrypt.hash('test123', 10);
//                 const testCompare = await bcrypt.compare('test123', testHash);
//                 console.log('Test bcrypt compare (should be true):', testCompare);
                
//                 return res.status(401).json({ error: 'Invalid credentials' });
//             }

//             // Generate token
//             const token = jwt.sign(
//                 { 
//                     userId: user.id, 
//                     username: user.username,
//                     role: user.role 
//                 },
//                 process.env.JWT_SECRET || 'your-secret-key',
//                 { expiresIn: '24h' }
//             );

//             console.log('✅ Admin login successful for:', user.username);

//             res.json({
//                 message: 'Login successful',
//                 token,
//                 user: {
//                     id: user.id,
//                     username: user.username,
//                     email: user.email,
//                     role: user.role,
//                     name: user.name
//                 }
//             });

//         } catch (error) {
//             console.error('❌ Admin login error:', error);
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     }

//     static async getProfile(req, res) {
//         try {
//             res.json({
//                 user: req.user
//             });
//         } catch (error) {
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     }
// }

// module.exports = AuthController;




const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthController {
    static async adminLogin(req, res) {
        try {
            const { username, password } = req.body;

            console.log('🔐 Admin login attempt:', { username });

            if (!username || !password) {
                console.log('❌ Missing credentials');
                return res.status(400).json({ error: 'Username and password are required' });
            }

            // Find user by username or email
            console.log('🔍 Searching for user by username:', username);
            let user = await User.findByUsername(username);
            
            if (!user) {
                console.log('🔍 User not found by username, trying email:', username);
                user = await User.findByEmail(username);
            }

            if (!user) {
                console.log('❌ User not found with username/email:', username);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            console.log('✅ User found:', { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            });

            // Check if user is admin
            if (!['admin', 'super_admin'].includes(user.role)) {
                console.log('❌ User is not admin. Role:', user.role);
                return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
            }

            console.log('🔑 Verifying password...');
            console.log('Input password:', `"${password}"`);
            console.log('Input password length:', password.length);
            console.log('User has password hash:', !!user.password);
            console.log('Password hash length:', user.password?.length);
            console.log('Password hash (first 20 chars):', user.password?.substring(0, 60));
            console.log('Password hash (full):', user.password);

            // ✅ ENHANCED DEBUGGING: Test multiple scenarios
            console.log('\n🧪 DEBUGGING PASSWORD VERIFICATION:');
            
            // Test 1: Direct bcrypt compare
            const isValidPassword = await bcrypt.compare(password, user.password);
            console.log('1. Direct bcrypt compare result:', isValidPassword);

            // Test 2: Check if password might have extra spaces
            const trimmedPassword = password.trim();
            const isTrimmedValid = await bcrypt.compare(trimmedPassword, user.password);
            console.log('2. Trimmed password compare result:', isTrimmedValid);

            // Test 3: Test with a known working bcrypt hash
            const testPassword = 'test123';
            const testHash = await bcrypt.hash(testPassword, 10);
            const testCompare = await bcrypt.compare(testPassword, testHash);
            console.log('3. Known password test result:', testCompare);

            // Test 4: Check if the stored hash is actually a bcrypt hash
            const isBcryptHash = user.password && (
                user.password.startsWith('$2a$') || 
                user.password.startsWith('$2b$') || 
                user.password.startsWith('$2y$')
            );
            console.log('4. Is valid bcrypt hash format:', isBcryptHash);

            // Test 5: Manual hash generation for debugging (BE CAREFUL - don't use in production)
            if (process.env.NODE_ENV === 'development') {
                const manualHash = await bcrypt.hash(password, 10);
                console.log('5. Manual hash of input password:', manualHash);
                console.log('6. Compare manual hash with stored:', manualHash === user.password);
            }

            if (!isValidPassword) {
                console.log('❌ Password verification failed. Possible issues:');
                console.log('   - Wrong password');
                console.log('   - Password hash corrupted during storage');
                console.log('   - Different bcrypt salt rounds during creation vs verification');
                console.log('   - Extra spaces in input password');
                console.log('   - Hash not properly stored in database');
                
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    username: user.username,
                    role: user.role 
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            console.log('✅ Admin login successful for:', user.username);

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    name: user.name
                }
            });

        } catch (error) {
            console.error('❌ Admin login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Add this method to debug user creation
    static async debugUserCreation(req, res) {
        try {
            const { username, password } = req.body;
            
            console.log('🔧 DEBUG USER CREATION:');
            console.log('Input username:', username);
            console.log('Input password:', password);
            console.log('Password length:', password.length);
            
            // Hash the password to see what it should look like
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            console.log('Generated hash:', hashedPassword);
            console.log('Hash length:', hashedPassword.length);
            console.log('Hash starts with:', hashedPassword.substring(0, 4));
            
            res.json({
                inputPassword: password,
                hashedPassword: hashedPassword,
                hashLength: hashedPassword.length
            });
            
        } catch (error) {
            console.error('Debug error:', error);
            res.status(500).json({ error: 'Debug failed' });
        }
    }

    static async getProfile(req, res) {
        try {
            res.json({
                user: req.user
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = AuthController;