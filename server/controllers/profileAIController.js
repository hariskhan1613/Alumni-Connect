import User from '../models/User.js';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Role-specific skill databases for matching
const ROLE_SKILLS = {
    'frontend developer': ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'typescript', 'tailwind', 'sass', 'webpack', 'responsive design', 'ui/ux', 'figma', 'next.js', 'redux'],
    'backend developer': ['node.js', 'express', 'python', 'java', 'api design', 'rest', 'graphql', 'authentication', 'api security', 'deployment', 'docker', 'databases', 'mongodb', 'sql', 'redis', 'microservices'],
    'full stack developer': ['html', 'css', 'javascript', 'react', 'node.js', 'express', 'mongodb', 'sql', 'git', 'docker', 'api design', 'authentication', 'deployment', 'typescript', 'redux'],
    'data scientist': ['python', 'machine learning', 'deep learning', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'sql', 'statistics', 'data visualization', 'r', 'scikit-learn', 'nlp', 'computer vision'],
    'mobile developer': ['react native', 'flutter', 'swift', 'kotlin', 'java', 'ios', 'android', 'firebase', 'rest api', 'ui design', 'app deployment', 'state management'],
    'devops engineer': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'terraform', 'ansible', 'linux', 'monitoring', 'networking', 'shell scripting', 'git'],
    'machine learning engineer': ['python', 'tensorflow', 'pytorch', 'machine learning', 'deep learning', 'mlops', 'docker', 'api design', 'data pipelines', 'statistics', 'computer vision', 'nlp'],
    'ui/ux designer': ['figma', 'sketch', 'adobe xd', 'wireframing', 'prototyping', 'user research', 'design systems', 'typography', 'color theory', 'accessibility', 'css', 'html'],
    'cybersecurity analyst': ['network security', 'penetration testing', 'encryption', 'firewalls', 'siem', 'incident response', 'vulnerability assessment', 'linux', 'python', 'compliance'],
    'cloud engineer': ['aws', 'azure', 'gcp', 'terraform', 'docker', 'kubernetes', 'serverless', 'networking', 'iam', 'monitoring', 'ci/cd', 'linux'],
};

// ATS keyword databases per role
const ATS_KEYWORDS = {
    'frontend developer': ['responsive', 'spa', 'component', 'hooks', 'state management', 'accessibility', 'performance optimization', 'cross-browser', 'testing', 'agile'],
    'backend developer': ['restful', 'middleware', 'orm', 'caching', 'queue', 'scalability', 'load balancing', 'rate limiting', 'testing', 'ci/cd'],
    'full stack developer': ['full stack', 'responsive', 'restful', 'database design', 'deployment', 'testing', 'agile', 'version control', 'performance', 'scalability'],
    'data scientist': ['eda', 'feature engineering', 'model training', 'hyperparameter', 'cross-validation', 'a/b testing', 'etl', 'big data', 'visualization', 'statistical analysis'],
    'mobile developer': ['native', 'cross-platform', 'push notifications', 'offline storage', 'app store', 'performance', 'responsive', 'testing', 'animations', 'state management'],
    'devops engineer': ['infrastructure as code', 'pipeline', 'containerization', 'orchestration', 'monitoring', 'alerting', 'high availability', 'disaster recovery', 'automation', 'security'],
};

// Master list of all known skills for detection
const ALL_SKILLS = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'r', 'scala', 'perl',
    'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material ui',
    'react', 'react.js', 'reactjs', 'angular', 'vue', 'vue.js', 'vuejs', 'next.js', 'nextjs', 'nuxt', 'svelte', 'redux', 'jquery',
    'node.js', 'nodejs', 'express', 'express.js', 'django', 'flask', 'fastapi', 'spring', 'spring boot', '.net', 'asp.net', 'laravel', 'rails',
    'mongodb', 'mysql', 'postgresql', 'sql', 'sqlite', 'redis', 'dynamodb', 'firebase', 'supabase', 'cassandra', 'elasticsearch',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify', 'digitalocean',
    'git', 'github', 'gitlab', 'bitbucket', 'ci/cd', 'jenkins', 'terraform', 'ansible',
    'react native', 'flutter', 'ionic', 'xamarin', 'android', 'ios', 'swift',
    'machine learning', 'deep learning', 'artificial intelligence', 'ai', 'ml', 'nlp', 'natural language processing',
    'computer vision', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'opencv',
    'data science', 'data analysis', 'data visualization', 'big data', 'hadoop', 'spark', 'tableau', 'power bi',
    'rest', 'rest api', 'graphql', 'grpc', 'websocket', 'socket.io', 'api design',
    'linux', 'unix', 'bash', 'shell scripting', 'powershell',
    'agile', 'scrum', 'jira', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
    'testing', 'jest', 'mocha', 'cypress', 'selenium', 'unit testing', 'integration testing',
    'blockchain', 'solidity', 'web3', 'ethereum',
    'networking', 'network security', 'cybersecurity', 'penetration testing', 'encryption',
    'microservices', 'serverless', 'api security', 'authentication', 'oauth', 'jwt',
    'responsive design', 'ui/ux', 'wireframing', 'prototyping', 'design systems',
    'deployment', 'devops', 'monitoring', 'load balancing',
];

// Parse actual PDF text and extract structured data
const parseCVFromText = (text) => {
    const lowerText = text.toLowerCase();

    // --- Extract Skills ---
    const foundSkills = [];
    ALL_SKILLS.forEach(skill => {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(lowerText) && !foundSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())) {
            // Capitalize properly
            foundSkills.push(skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
        }
    });

    // --- Extract Projects ---
    const projects = [];
    const projectPatterns = [
        /(?:project|projects)\s*[:\-–—]?\s*\n?([\s\S]*?)(?=\n\s*(?:experience|education|certification|skills|internship|work|achievement|award|reference|hobby|language|$))/gi,
        /(?:projects?\s*(?:done|completed|built|developed))\s*[:\-–—]?\s*\n?([\s\S]*?)(?=\n\s*(?:experience|education|certification|skills|$))/gi,
    ];
    for (const pattern of projectPatterns) {
        const match = pattern.exec(text);
        if (match && match[1]) {
            const projectBlock = match[1].trim();
            // Split by bullet points, numbers, or line breaks with capital letters
            const items = projectBlock.split(/(?:\n\s*[-•●▪▸]\s*|\n\s*\d+\.\s*|\n(?=[A-Z]))/);
            items.forEach(item => {
                const cleaned = item.trim();
                if (cleaned.length > 5 && cleaned.length < 200) {
                    const titleMatch = cleaned.match(/^([^\n.]+)/);
                    if (titleMatch) {
                        const title = titleMatch[1].trim().replace(/^[-•●▪▸]\s*/, '');
                        if (title.length > 3 && title.length < 100) {
                            const desc = cleaned.replace(titleMatch[0], '').trim().replace(/^[-–—:]\s*/, '');
                            const techsInProject = foundSkills.filter(s => cleaned.toLowerCase().includes(s.toLowerCase()));
                            projects.push({
                                title,
                                description: desc || `Project involving ${techsInProject.slice(0, 3).join(', ') || 'various technologies'}`,
                                technologies: techsInProject.length > 0 ? techsInProject.slice(0, 5) : [],
                                link: '',
                            });
                        }
                    }
                }
            });
        }
    }

    // --- Extract Internships / Experience ---
    const internships = [];
    const expPatterns = [
        /(?:experience|internship|work\s*history|employment)\s*[:\-–—]?\s*\n?([\s\S]*?)(?=\n\s*(?:project|education|certification|skills|achievement|award|reference|hobby|$))/gi,
    ];
    for (const pattern of expPatterns) {
        const match = pattern.exec(text);
        if (match && match[1]) {
            const block = match[1].trim();
            const items = block.split(/\n(?=[A-Z•●▪▸-])/);
            items.forEach(item => {
                const cleaned = item.trim();
                if (cleaned.length > 10) {
                    const companyMatch = cleaned.match(/(?:at|@)\s+([A-Z][a-zA-Z\s&.]+)/);
                    const roleMatch = cleaned.match(/^([^\n|–—]+?)(?:\s*[-–—|]\s*|\s+at\s+|\s*\n)/);
                    const durationMatch = cleaned.match(/(\d+\s*(?:month|year|week)s?|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s*\d{2,4}\s*[-–—to]+\s*\w+\s*\d{0,4})/i);

                    internships.push({
                        company: companyMatch ? companyMatch[1].trim() : 'Company',
                        role: roleMatch ? roleMatch[1].trim().substring(0, 60) : cleaned.substring(0, 50),
                        duration: durationMatch ? durationMatch[1].trim() : '',
                        description: cleaned.substring(0, 200),
                    });
                }
            });
        }
    }

    // --- Extract Certifications ---
    const certifications = [];
    const certPatterns = [
        /(?:certification|certifications|certificates|certified)\s*[:\-–—]?\s*\n?([\s\S]*?)(?=\n\s*(?:project|education|experience|skills|internship|achievement|award|reference|hobby|$))/gi,
    ];
    for (const pattern of certPatterns) {
        const match = pattern.exec(text);
        if (match && match[1]) {
            const block = match[1].trim();
            const items = block.split(/\n\s*[-•●▪▸]\s*|\n\s*\d+\.\s*|\n(?=[A-Z])/);
            items.forEach(item => {
                const cleaned = item.trim();
                if (cleaned.length > 5 && cleaned.length < 150) {
                    const issuerMatch = cleaned.match(/(?:by|from|issued by|–|—|\|)\s*([A-Z][a-zA-Z\s&.]+)/);
                    const dateMatch = cleaned.match(/\b(20[12]\d)\b/);
                    certifications.push({
                        name: cleaned.replace(/\s*[-–—|].*$/, '').trim().substring(0, 80),
                        issuer: issuerMatch ? issuerMatch[1].trim() : '',
                        date: dateMatch ? dateMatch[1] : '',
                        link: '',
                    });
                }
            });
        }
    }

    return {
        skills: foundSkills.length > 0 ? foundSkills : ['JavaScript', 'HTML', 'CSS'],
        projects: projects.slice(0, 5),
        internships: internships.slice(0, 4),
        certifications: certifications.slice(0, 5),
        rawTextLength: text.length,
    };
};

// Calculate profile strength (0-100)
const calculateProfileStrength = (user) => {
    let score = 0;
    const weights = {
        name: 5,
        bio: 10,
        profilePic: 5,
        skills: 20,
        projects: 20,
        internships: 15,
        certifications: 10,
        course: 5,
        linkedIn: 5,
        targetRole: 5,
    };

    if (user.name) score += weights.name;
    if (user.bio && user.bio.length > 20) score += weights.bio;
    if (user.profilePic) score += weights.profilePic;
    if (user.skills && user.skills.length > 0) score += Math.min(weights.skills, user.skills.length * 4);
    if (user.projects && user.projects.length > 0) score += Math.min(weights.projects, user.projects.length * 7);
    if (user.internships && user.internships.length > 0) score += Math.min(weights.internships, user.internships.length * 8);
    if (user.certifications && user.certifications.length > 0) score += Math.min(weights.certifications, user.certifications.length * 5);
    if (user.course) score += weights.course;
    if (user.linkedIn) score += weights.linkedIn;
    if (user.targetRole) score += weights.targetRole;

    return Math.min(100, Math.round(score));
};

// Calculate role readiness
const calculateRoleReadiness = (user, targetRole) => {
    const roleKey = targetRole.toLowerCase();
    const roleSkills = ROLE_SKILLS[roleKey] || ROLE_SKILLS['full stack developer'];
    const userSkills = (user.skills || []).map(s => s.toLowerCase());

    let matchCount = 0;
    const matchedSkills = [];
    const missingSkills = [];

    roleSkills.forEach(skill => {
        if (userSkills.some(us => us.includes(skill) || skill.includes(us))) {
            matchCount++;
            matchedSkills.push(skill);
        } else {
            missingSkills.push(skill);
        }
    });

    const projectBonus = Math.min(10, (user.projects?.length || 0) * 3);
    const internshipBonus = Math.min(10, (user.internships?.length || 0) * 5);
    const certBonus = Math.min(5, (user.certifications?.length || 0) * 2);

    const baseScore = (matchCount / roleSkills.length) * 75;
    const totalScore = Math.min(100, Math.round(baseScore + projectBonus + internshipBonus + certBonus));

    return { score: totalScore, matchedSkills, missingSkills };
};

// Upload CV and auto-generate profile
export const uploadCV = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let parsed;

        if (req.file) {
            // Actually read and parse the PDF
            const pdfBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdfParse(pdfBuffer);
            const extractedText = pdfData.text || '';

            if (extractedText.length < 20) {
                return res.status(400).json({ message: 'Could not extract text from PDF. Please ensure the PDF is not image-only.' });
            }

            parsed = parseCVFromText(extractedText);
        } else {
            return res.status(400).json({ message: 'No PDF file uploaded' });
        }

        // Merge new skills with existing (no duplicates)
        const existingSkills = (user.skills || []).map(s => s.toLowerCase());
        const newSkills = parsed.skills.filter(s => !existingSkills.includes(s.toLowerCase()));
        user.skills = [...(user.skills || []), ...newSkills];

        // Always overwrite with parsed data from new CV
        if (parsed.projects.length > 0) user.projects = parsed.projects;
        if (parsed.internships.length > 0) user.internships = parsed.internships;
        if (parsed.certifications.length > 0) user.certifications = parsed.certifications;
        user.cvUrl = req.file.originalname;

        // Recalculate scores
        user.profileStrengthScore = calculateProfileStrength(user);
        if (user.targetRole) {
            const readiness = calculateRoleReadiness(user, user.targetRole);
            user.roleReadinessScore = readiness.score;
        }

        await user.save();

        res.json({
            message: 'CV processed successfully',
            extractedSkills: parsed.skills.length,
            extractedProjects: parsed.projects.length,
            extractedInternships: parsed.internships.length,
            extractedCertifications: parsed.certifications.length,
            profile: {
                skills: user.skills,
                projects: user.projects,
                internships: user.internships,
                certifications: user.certifications,
                profileStrengthScore: user.profileStrengthScore,
                roleReadinessScore: user.roleReadinessScore,
                cvUrl: user.cvUrl,
            },
        });
    } catch (error) {
        console.error('CV Upload Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get profile score
export const getProfileScore = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const score = calculateProfileStrength(user);
        user.profileStrengthScore = score;
        await user.save();

        res.json({ profileStrengthScore: score });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Calculate role readiness
export const getRoleReadiness = async (req, res) => {
    try {
        const { targetRole } = req.body;
        if (!targetRole) return res.status(400).json({ message: 'Target role is required' });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.targetRole = targetRole;
        const readiness = calculateRoleReadiness(user, targetRole);
        user.roleReadinessScore = readiness.score;
        await user.save();

        res.json({
            targetRole,
            readinessScore: readiness.score,
            matchedSkills: readiness.matchedSkills,
            missingSkills: readiness.missingSkills,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate resume for role
export const generateResume = async (req, res) => {
    try {
        const { targetRole } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const role = targetRole || user.targetRole || 'Full Stack Developer';
        const readiness = calculateRoleReadiness(user, role);

        const resume = {
            header: {
                name: user.name,
                email: user.email,
                location: user.location || 'India',
                linkedIn: user.linkedIn || '',
                targetRole: role,
            },
            summary: `Motivated ${user.course || 'Computer Science'} student with hands-on experience in ${(user.skills || []).slice(0, 4).join(', ')}. Seeking a ${role} role to leverage technical expertise and project experience.`,
            skills: user.skills || [],
            projects: (user.projects || []).map(p => ({
                title: p.title,
                description: p.description,
                technologies: p.technologies,
            })),
            internships: (user.internships || []).map(i => ({
                company: i.company,
                role: i.role,
                duration: i.duration,
                description: i.description,
            })),
            certifications: (user.certifications || []).map(c => ({
                name: c.name,
                issuer: c.issuer,
                date: c.date,
            })),
            education: {
                course: user.course || '',
                batch: user.batch || '',
            },
        };

        res.json({ resume, readinessScore: readiness.score });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ATS Score
export const getATSScore = async (req, res) => {
    try {
        const { targetRole } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const role = targetRole || user.targetRole || 'Full Stack Developer';
        const roleKey = role.toLowerCase();
        const roleSkills = ROLE_SKILLS[roleKey] || ROLE_SKILLS['full stack developer'];
        const atsKeywords = ATS_KEYWORDS[roleKey] || ATS_KEYWORDS['full stack developer'] || [];
        const userSkills = (user.skills || []).map(s => s.toLowerCase());

        // Calculate ATS format score
        let formatScore = 0;
        if (user.name) formatScore += 10;
        if (user.email) formatScore += 10;
        if ((user.skills || []).length >= 5) formatScore += 15;
        if ((user.projects || []).length >= 2) formatScore += 15;
        if ((user.internships || []).length >= 1) formatScore += 15;
        if (user.bio && user.bio.length > 30) formatScore += 10;
        if ((user.certifications || []).length >= 1) formatScore += 10;
        if (user.linkedIn) formatScore += 5;
        if (user.location) formatScore += 5;
        if (user.course) formatScore += 5;

        // Skill match score
        const matchedSkills = roleSkills.filter(skill =>
            userSkills.some(us => us.includes(skill) || skill.includes(us))
        );
        const missingSkills = roleSkills.filter(skill =>
            !userSkills.some(us => us.includes(skill) || skill.includes(us))
        );
        const skillScore = (matchedSkills.length / roleSkills.length) * 100;

        // Keyword suggestions
        const suggestedKeywords = atsKeywords.filter(kw =>
            !userSkills.some(us => us.includes(kw) || kw.includes(us))
        );

        const atsScore = Math.min(100, Math.round((formatScore * 0.4) + (skillScore * 0.6)));
        user.resumeScore = atsScore;
        await user.save();

        res.json({
            atsScore,
            formatScore: Math.min(100, formatScore),
            skillMatchScore: Math.round(skillScore),
            matchedSkills,
            missingSkills: missingSkills.slice(0, 8),
            suggestedKeywords: suggestedKeywords.slice(0, 6),
            improvements: [
                ...(missingSkills.length > 0 ? [`Add missing skills: ${missingSkills.slice(0, 3).join(', ')}`] : []),
                ...(!user.bio || user.bio.length < 30 ? ['Write a detailed professional summary'] : []),
                ...((user.projects || []).length < 2 ? ['Add more project experiences'] : []),
                ...(!user.linkedIn ? ['Add your LinkedIn profile link'] : []),
                ...(suggestedKeywords.length > 0 ? [`Include ATS keywords: ${suggestedKeywords.slice(0, 3).join(', ')}`] : []),
            ],
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update AI profile fields
export const updateAIProfile = async (req, res) => {
    try {
        const { projects, internships, certifications, targetRole, skills } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (projects !== undefined) user.projects = projects;
        if (internships !== undefined) user.internships = internships;
        if (certifications !== undefined) user.certifications = certifications;
        if (targetRole !== undefined) user.targetRole = targetRole;
        if (skills !== undefined) user.skills = skills;

        // Recalculate scores
        user.profileStrengthScore = calculateProfileStrength(user);
        if (user.targetRole) {
            const readiness = calculateRoleReadiness(user, user.targetRole);
            user.roleReadinessScore = readiness.score;
        }

        // Add to score history (max one entry per day)
        const today = new Date().toISOString().split('T')[0];
        const lastEntry = user.scoreHistory?.[user.scoreHistory.length - 1];
        const lastDate = lastEntry?.date ? new Date(lastEntry.date).toISOString().split('T')[0] : null;

        if (lastDate !== today) {
            user.scoreHistory = [...(user.scoreHistory || []), {
                date: new Date(),
                profileStrength: user.profileStrengthScore,
                roleReadiness: user.roleReadinessScore,
                resumeScore: user.resumeScore || 0,
            }];
            // Keep only last 30 entries
            if (user.scoreHistory.length > 30) {
                user.scoreHistory = user.scoreHistory.slice(-30);
            }
        }

        // Calculate skill growth score
        const history = user.scoreHistory || [];
        if (history.length >= 2) {
            const first = history[0];
            const last = history[history.length - 1];
            const growth = ((last.profileStrength - first.profileStrength) +
                (last.roleReadiness - first.roleReadiness) +
                (last.resumeScore - first.resumeScore)) / 3;
            user.skillGrowthScore = Math.max(0, Math.min(100, Math.round(50 + growth)));
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                skills: user.skills,
                projects: user.projects,
                internships: user.internships,
                certifications: user.certifications,
                targetRole: user.targetRole,
                profileStrengthScore: user.profileStrengthScore,
                roleReadinessScore: user.roleReadinessScore,
                resumeScore: user.resumeScore,
                skillGrowthScore: user.skillGrowthScore,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get full AI profile data
export const getAIProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Recalculate fresh scores
        user.profileStrengthScore = calculateProfileStrength(user);
        if (user.targetRole) {
            const readiness = calculateRoleReadiness(user, user.targetRole);
            user.roleReadinessScore = readiness.score;
        }
        await user.save();

        res.json({
            skills: user.skills || [],
            projects: user.projects || [],
            internships: user.internships || [],
            certifications: user.certifications || [],
            targetRole: user.targetRole || '',
            profileStrengthScore: user.profileStrengthScore,
            roleReadinessScore: user.roleReadinessScore,
            resumeScore: user.resumeScore || 0,
            skillGrowthScore: user.skillGrowthScore || 0,
            scoreHistory: user.scoreHistory || [],
            badges: user.badges || [],
            credits: user.credits || 10,
            cvUrl: user.cvUrl || '',
            name: user.name,
            email: user.email,
            bio: user.bio,
            course: user.course,
            batch: user.batch,
            linkedIn: user.linkedIn,
            location: user.location,
            profilePic: user.profilePic,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get available target roles
export const getTargetRoles = async (req, res) => {
    try {
        const roles = Object.keys(ROLE_SKILLS).map(role =>
            role.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        );
        res.json({ roles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
