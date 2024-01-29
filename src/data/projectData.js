import moodyImage from '../images/project/moody.png';
import hearNatureImage from '../images/project/hear-nature.png';
import clearClick from '../images/project/clear-click.png';
import musicMatch from '../images/project/music-match.png';
import websiteHub from '../images/project/website-hub.png';


export const projectsData = [
    {
        id: 1,
        name: 'ClearClick',
        desc: 'A Chrome Extension for Enhanced Web Navigation, targeted at assisting elderly users and those with reading disabilities.',
        image: clearClick,
        demo: 'https://www.canva.com/design/DAF5EA_V4zM/MKI1MAXLjm9NDXWs2_ojRQ/edit',
        code: 'https://github.com/jerryiscat/clear-click', 
        tags: ['JavaScript', 'Node.js', 'OpenAI API', 'Web Audio API']
    },
    {
        id: 2,
        name: 'MusicMatch',
        desc: 'A music data-driven music social media website, empowered by OpenAI API to generalize music personality and match music buddies!',
        image: musicMatch,
        demo: 'https://github.com/jerryiscat/music-match/blob/main/README.md', 
        code: 'https://github.com/jerryiscat/music-match/blob/main/README.md', 
        tags: ['Express.js', 'Vue.js', 'Spotify API']
    },
    {
        id: 3,
        name: 'WebsiteHub',
        desc: 'A user-centric web platform for sharing and interacting with links.',
        image: websiteHub,
        demo: 'https://github.com/jerryiscat/website-hub/blob/main/README.md', 
        code: 'https://github.com/jerryiscat/website-hub/blob/main/README.md', 
        tags: ['React', 'Express.js', 'MongoDB', 'Azure']
    },
    {
        id: 4,
        name: 'Moody',
        desc: 'A website allowing users to record their mood and listen to corresponding music.',
        image: moodyImage, 
        demo: 'https://moody-340.web.app/',
        code: 'https://github.com/jerryiscat/Moody', 
        tags: ['React', 'CSS', 'Firebase']
    },
    {
        id: 5,
        name: 'HearNature',
        desc: 'An Android app for recording and browsing nature sounds.',
        image: hearNatureImage, 
        demo: 'https://github.com/jerryiscat/HearNature', // Replace with actual URL if available
        code: 'https://github.com/jerryiscat/HearNature',
        tags: ['Java', 'Android', 'Audio']
    },
    // {
    //     id: 3,
    //     name: 'Cfashion',
    //     desc: 'A full-stack E-Commerce platform and Admin Dashboard.',
    //     image: 'path_to_Cfashion_image', // Replace with actual image path
    //     demo: 'url_to_Cfashion_demo', // Replace with actual URL if available
    //     code: 'url_to_Cfashion_repository', // Replace with actual repository URL
    //     tags: ['React', 'Next.js', 'Tailwind CSS', 'Prisma', 'MongoDB', 'NextAuth']
    // },
];
