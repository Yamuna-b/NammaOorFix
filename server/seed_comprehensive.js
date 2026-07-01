// seed_comprehensive.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Issue = require('./models/Issue');
const Ward = require('./models/Ward');

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://Swetha:Swetha2005@cluster0.gq1ro.mongodb.net/nammaoorfix?retryWrites=true&w=majority';

async function seedDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');

    // 1. Clear existing collections
    console.log('Clearing existing Wards, Issues, and Users...');
    await Ward.deleteMany({});
    await Issue.deleteMany({});
    await User.deleteMany({});
    console.log('Collections cleared.');

    // 2. Parse and seed Wards from CSV
    const csvPath = path.join(__dirname, '../Datasets/madurai_comprehensive_location_lookup_SAFE.csv');
    console.log(`Reading wards from ${csvPath}...`);
    if (fs.existsSync(csvPath)) {
      const raw = fs.readFileSync(csvPath, 'utf8');
      const lines = raw.split(/\r?\n/).filter(Boolean);
      if (lines.length > 1) {
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        const idxWard = header.findIndex(h => h.includes('ward'));
        const idxZone = header.findIndex(h => h.includes('zone'));
        const idxName = header.findIndex(h => h.includes('name') || h.includes('chairperson')); // fallback name
        
        const wardOps = [];
        for (let i = 1; i < lines.length; i++) {
          // simple csv parser splitting by comma outside quotes
          const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (cols.length < 2) continue;
          
          const wardNumber = (cols[idxWard] || '').trim();
          let zoneNumber = (cols[idxZone] || '').trim();
          // Extract short zone name/number (e.g., "ZONE II" or "Zone 2" or "2")
          if (zoneNumber.includes('ZONE')) {
            const match = zoneNumber.match(/ZONE\s+([IVXLCDM\d]+)/i);
            if (match) zoneNumber = match[1];
          }
          
          const name = idxName >= 0 ? (cols[idxName] || '').trim().replace(/^"|"$/g, '') : `Ward ${wardNumber}`;
          
          if (!wardNumber || !zoneNumber) continue;
          
          wardOps.push({
            city: 'Madurai',
            wardNumber,
            zoneNumber,
            name: name || `Ward ${wardNumber} (Zone ${zoneNumber})`
          });
        }
        
        if (wardOps.length) {
          const uniqueWards = [];
          const seen = new Set();
          for (const w of wardOps) {
            const key = `${w.wardNumber}-${w.zoneNumber}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueWards.push(w);
            }
          }
          await Ward.insertMany(uniqueWards);
          console.log(`Seeded ${uniqueWards.length} unique wards.`);
        }
      }
    } else {
      console.warn('Wards CSV file not found! Seeding basic default wards.');
      const defaultWards = [];
      for (let w = 1; w <= 100; w++) {
        const zone = Math.ceil(w / 25).toString();
        defaultWards.push({
          city: 'Madurai',
          wardNumber: w.toString(),
          zoneNumber: zone,
          name: `Ward ${w} Area`
        });
      }
      await Ward.insertMany(defaultWards);
      console.log('Seeded 100 default wards.');
    }

    // 3. Create Users
    console.log('Seeding users...');
    const usersToCreate = [
      { username: 'anya', email: 'anya@example.com', password: 'Password123', name: 'Anya B.', role: 'user' },
      { username: 'yamuna', email: 'yamuna@example.com', password: 'Password123', name: 'Yamuna M.', role: 'user' },
      { username: 'karthik', email: 'karthik@example.com', password: 'Password123', name: 'Karthik Raja', role: 'user' },
      { username: 'eb_official', email: 'eb@nammaoorfix.gov.in', password: 'Password123', name: 'EB Support Officer', role: 'official', department: 'EB', isVerified: true },
      { username: 'mc_official', email: 'corp@nammaoorfix.gov.in', password: 'Password123', name: 'Madurai Corp Commissioner', role: 'official', department: 'Madurai Corp', isVerified: true },
      { username: 'water_official', email: 'water@nammaoorfix.gov.in', password: 'Password123', name: 'Metro Water Engineer', role: 'official', department: 'Water Supply', isVerified: true },
      { username: 'health_official', email: 'health@nammaoorfix.gov.in', password: 'Password123', name: 'Public Health Inspector', role: 'official', department: 'Health', isVerified: true },
      { username: 'admin', email: 'admin@nammaoorfix.gov.in', password: 'Admin123', name: 'System Admin', role: 'admin', isVerified: true }
    ];

    const createdUsers = [];
    for (const u of usersToCreate) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`Seeded ${createdUsers.length} users successfully.`);

    const userCitizen1 = createdUsers.find(u => u.username === 'anya');
    const userCitizen2 = createdUsers.find(u => u.username === 'yamuna');
    const userCitizen3 = createdUsers.find(u => u.username === 'karthik');
    const officialEb = createdUsers.find(u => u.username === 'eb_official');
    const officialMc = createdUsers.find(u => u.username === 'mc_official');
    const officialWater = createdUsers.find(u => u.username === 'water_official');
    const officialHealth = createdUsers.find(u => u.username === 'health_official');

    // 4. Create realistic Madurai public service issues
    console.log('Seeding realistic Madurai public service issues...');

    const dbWards = await Ward.find({ city: 'Madurai' });
    const getWardInfo = (wardNum) => {
      const w = dbWards.find(x => x.wardNumber === wardNum.toString()) || dbWards[0];
      return { wardNumber: w.wardNumber, zoneNumber: w.zoneNumber };
    };

    const issuesData = [
      {
        title: 'Severe Garbage Pileup near Meenakshi Amman Temple (North Tower)',
        description: 'A massive pile of domestic and commercial waste has accumulated near the North Tower gate of the temple. The garbage is overflowing onto the street, blocking the pedestrian pathway, emitting a horrible stench, and attracting stray animals. Since this is a high-traffic area for tourists and pilgrims, immediate clearance is required.',
        category: 'Garbage Collection',
        wardNumber: '12',
        location: { lat: 9.9218, lng: 78.1189, address: 'North Tower Street, near Meenakshi Amman Temple, Madurai' },
        streetName: 'North Tower Street',
        landmark: 'North Tower Gate',
        fullAddress: 'North Tower Street, Madurai Main, Madurai - 625001',
        pincode: '625001',
        severity: 'red',
        urgencyScore: 85,
        status: 'Reported',
        reportedBy: userCitizen1._id,
        upvotes: [userCitizen2._id, userCitizen3._id],
        comments: [
          { user: userCitizen2._id, text: 'This is absolutely disgusting. Tourists are covering their noses when passing by. Please clear it immediately!' },
          { user: userCitizen3._id, text: 'The garbage bins have not been cleared by the municipal truck for 3 days.' }
        ]
      },
      {
        title: 'Dangerous Potholes and Crater on Arapalayam Main Road',
        description: 'Multiple deep, water-filled potholes have formed on Arapalayam Main Road near the central bus stand. Two-wheelers frequently lose balance trying to dodge these craters, especially during night hours and rainy spells. It is a major safety hazard and is causing severe traffic jams during peak commuter hours.',
        category: 'Road Damage',
        wardNumber: '29',
        location: { lat: 9.9285, lng: 78.1065, address: 'Arapalayam Main Road, near Arapalayam Bus Stand, Madurai' },
        streetName: 'Arapalayam Main Road',
        landmark: 'Near Arapalayam Bus Stand',
        fullAddress: 'Arapalayam Main Road, Arapalayam, Madurai - 625016',
        pincode: '625016',
        severity: 'red',
        urgencyScore: 92,
        status: 'In Progress',
        reportedBy: userCitizen2._id,
        upvotes: [userCitizen1._id, userCitizen3._id],
        assignedDepartment: 'Madurai Corp',
        assignedOfficial: officialMc._id,
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        officialReplies: [
          { user: officialMc._id, text: 'We have received the complaint. PWD road division has been notified. Patchwork and asphalt laying have been scheduled to start tonight.' }
        ],
        comments: [
          { user: userCitizen3._id, text: 'Saw some workers dumping gravel today, but proper tarring is needed.' }
        ]
      },
      {
        title: 'Foul Sewerage Overflow and Drainage Blockage at Goripalayam Junction',
        description: 'The main underground sewer line has choked, causing black, smelly sewerage water to bubble up and flood the Goripalayam intersection. Pedestrians cannot cross the street, and the stagnant water is splashing onto vehicles, posing a serious health threat to nearby food stall owners and shopkeepers.',
        category: 'Sewerage',
        wardNumber: '16',
        location: { lat: 9.9298, lng: 78.1278, address: 'Goripalayam Junction, Madurai' },
        streetName: 'Goripalayam Junction Road',
        landmark: 'Goripalayam Mosque',
        fullAddress: 'Goripalayam Junction, Goripalayam, Madurai - 625002',
        pincode: '625002',
        severity: 'red',
        urgencyScore: 95,
        status: 'Acknowledged',
        reportedBy: userCitizen3._id,
        upvotes: [userCitizen1._id, userCitizen2._id],
        assignedDepartment: 'Water Supply', // Sewerage is under Water Supply department
        assignedOfficial: officialWater._id,
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        officialReplies: [
          { user: officialWater._id, text: 'Our sewage clearing suction truck is being dispatched to clear the blockage. Work will commence in a couple of hours.' }
        ]
      },
      {
        title: 'Broken Streetlights and Dark Stretches in K. Pudur Industrial Area',
        description: 'The entire line of streetlights along Pudur Vandipathai near the industrial estate is dead. This long stretch of road becomes pitch dark after sunset, making it highly unsafe for factory workers (especially women) who commute by foot or cycle late at night.',
        category: 'Street Light',
        wardNumber: '16',
        location: { lat: 9.9430, lng: 78.1415, address: 'Pudur Vandipathai, K. Pudur, Madurai' },
        streetName: 'Pudur Vandipathai',
        landmark: 'Opposite Industrial Estate Gate',
        fullAddress: 'Pudur Vandipathai Road, K. Pudur, Madurai - 625007',
        pincode: '625007',
        severity: 'yellow',
        urgencyScore: 78,
        status: 'Resolved',
        reportedBy: userCitizen1._id,
        upvotes: [userCitizen2._id],
        assignedDepartment: 'EB',
        assignedOfficial: officialEb._id,
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        officialReplies: [
          { user: officialEb._id, text: 'Our maintenance line crew has inspected the spot. We replaced 12 broken LED bulbs and restored the underground cable connection. The streetlights are now fully operational.' }
        ],
        comments: [
          { user: userCitizen1._id, text: 'Thank you! The streetlights are working fine now. The road feels much safer.' }
        ]
      },
      {
        title: 'Contaminated Muddy Tap Water in Villangudi Residential Area',
        description: 'The municipal tap water supplied to Villangudi 2nd Main Street is muddy, yellowish-brown, and has a strong sewage smell. Many households are reporting cases of dysentery and stomach bugs. It appears there is a leak in the drinking water pipe crossing a drainage channel.',
        category: 'Water Supply',
        wardNumber: '1',
        location: { lat: 9.9482, lng: 78.0984, address: '7/27, 2nd Main Street, New Vilangudi, Madurai' },
        streetName: '2nd Main Street',
        landmark: 'Near New Vilangudi Water Tank',
        fullAddress: '2nd Main Street, New Vilangudi, Madurai - 625018',
        pincode: '625018',
        severity: 'red',
        urgencyScore: 89,
        status: 'In Progress',
        reportedBy: userCitizen2._id,
        upvotes: [userCitizen1._id, userCitizen3._id],
        assignedDepartment: 'Water Supply',
        assignedOfficial: officialWater._id,
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        officialReplies: [
          { user: officialWater._id, text: 'Water pipeline inspectors are testing the supply valves. We are digging the main road connection to locate the cross-contamination. Residents are advised to boil water before drinking.' }
        ]
      },
      {
        title: 'Illegal Dumping of Construction Debris on Bypass Road near Kalavasal',
        description: 'Some local builders have dumped tons of concrete slabs, bricks, and soil on the side of the bypass road near Kalavasal. This illegal dumping is blocking the left-turn lane, generating heavy dust, and forcing two-wheelers into the middle of the fast-moving highway traffic.',
        category: 'Illegal Dumping',
        wardNumber: '29',
        location: { lat: 9.9234, lng: 78.0921, address: 'Madurai Bypass Road, near Kalavasal, Madurai' },
        streetName: 'Bypass Road',
        landmark: 'Near Kalavasal Junction',
        fullAddress: 'Madurai Bypass Road, Kalavasal, Madurai - 625016',
        pincode: '625016',
        severity: 'yellow',
        urgencyScore: 68,
        status: 'Reported',
        reportedBy: userCitizen3._id,
        upvotes: [userCitizen2._id],
        comments: [
          { user: userCitizen2._id, text: 'This happens every midnight. Trucks dump debris when no one is watching. Fine should be imposed!' }
        ]
      },
      {
        title: 'Stray Cattle Hazard inside Mattuthavani Bus Terminal',
        description: 'A large pack of stray cows and bulls roam freely inside the bus terminal platforms. They eat waste from food stalls, block bus bays, and cause accidents when startled by loud horns. Several passengers have been chased and injured while carrying luggage.',
        category: 'Public Safety',
        wardNumber: '3',
        location: { lat: 9.9392, lng: 78.1512, address: 'Mattuthavani Bus Stand, Madurai' },
        streetName: 'Mattuthavani Integrated Bus Terminal Road',
        landmark: 'Platform 4',
        fullAddress: 'Mattuthavani Bus Terminal, Madurai - 625007',
        pincode: '625007',
        severity: 'yellow',
        urgencyScore: 72,
        status: 'Acknowledged',
        reportedBy: userCitizen1._id,
        upvotes: [userCitizen3._id],
        assignedDepartment: 'Madurai Corp',
        assignedOfficial: officialMc._id,
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        officialReplies: [
          { user: officialMc._id, text: 'We are deploying the stray cattle capture squad to round up the cattle and transfer them to the municipal animal shelter. Fines will be issued to owners who let cattle roam.' }
        ]
      },
      {
        title: 'Open Drainage Overflow flooding houses near Sellur Vaigai Bank',
        description: 'The open drain running parallel to the Sellur Vaigai riverbank is clogged with plastic bags and bottles. Due to the block, the sewage water has overflowed into the residential streets. Stagnant dirty water has entered the courtyards of multiple homes and created a massive mosquito infestation.',
        category: 'Sewerage',
        wardNumber: '20',
        location: { lat: 9.9354, lng: 78.1158, address: 'Riverbank Road, Sellur, Madurai' },
        streetName: 'Riverbank Road',
        landmark: 'Near Sellur Overhead Water Tank',
        fullAddress: 'Riverbank Road, Sellur, Madurai - 625002',
        pincode: '625002',
        severity: 'red',
        urgencyScore: 91,
        status: 'In Progress',
        reportedBy: userCitizen2._id,
        upvotes: [userCitizen1._id, userCitizen3._id],
        assignedDepartment: 'Health', // Health deals with mosquito control/overflow sanitation
        assignedOfficial: officialHealth._id,
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        officialReplies: [
          { user: officialHealth._id, text: 'Health sanitary workers are cleaning the trash from the canal to allow free flow. Additionally, we are initiating mosquito fogging in the surrounding houses.' }
        ]
      },
      {
        title: 'Broken Traffic Signal at Anna Nagar 80 Feet Road Junction',
        description: 'The main traffic light at the busy Anna Nagar 80 feet road junction is not working. The signal lights are completely blacked out, leading to absolute chaos and near-collisions as vehicles try to cross from four directions simultaneously. No traffic police officer is stationed here.',
        category: 'Traffic Signal',
        wardNumber: '15',
        location: { lat: 9.9198, lng: 78.1405, address: '80 Feet Road Junction, Anna Nagar, Madurai' },
        streetName: '80 Feet Road',
        landmark: 'Near Apollo Hospital Signal',
        fullAddress: '80 Feet Road, Anna Nagar, Madurai - 625020',
        pincode: '625020',
        severity: 'red',
        urgencyScore: 88,
        status: 'Resolved',
        reportedBy: userCitizen3._id,
        upvotes: [userCitizen1._id, userCitizen2._id],
        assignedDepartment: 'EB', // EB helps fix signal lines
        assignedOfficial: officialEb._id,
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        officialReplies: [
          { user: officialEb._id, text: 'The signal controller board was damaged due to a voltage fluctuation. We have replaced the motherboard and calibrated the timer. The signal is now active and operating normally.' }
        ],
        comments: [
          { user: userCitizen3._id, text: 'Confirmed. Signal is working now and traffic flow is smooth. Thanks!' }
        ]
      },
      {
        title: 'Deafening Commercial Speakers in Simmakkal Market Area',
        description: 'Several cloth and retail stores in the Simmakkal bazaar are playing extremely loud advertising jingles on high-wattage horn speakers placed on the pavement. This noise continues non-stop from 9 AM to 10 PM. Nearby residents, school children, and clinic patients are suffering from headaches.',
        category: 'Noise Pollution',
        wardNumber: '12',
        location: { lat: 9.9242, lng: 78.1215, address: 'Simmakkal Market, Madurai' },
        streetName: 'Simmakkal Bazaar Road',
        landmark: 'Near Simmakkal Clock Tower',
        fullAddress: 'Bazaar Street, Simmakkal, Madurai - 625001',
        pincode: '625001',
        severity: 'blue',
        urgencyScore: 50,
        status: 'Reported',
        reportedBy: userCitizen1._id,
        upvotes: [userCitizen2._id],
        comments: [
          { user: userCitizen2._id, text: 'This is a daily nuisance. You cannot walk in the street without getting a headache. Shop owners ignore any polite requests to lower the volume.' }
        ]
      },
      {
        title: 'Broken Fencing and Algae Filled Water at Tallakulam Eco Park',
        description: 'Tallakulam Eco Park is in a state of severe neglect. The perimeter iron fence is broken in several places, letting stray dogs inside. The park pond is covered in green algae and filled with floating plastic bottles. The children play swings are completely rusted and broken, making them unsafe.',
        category: 'Park Maintenance',
        wardNumber: '17',
        location: { lat: 9.9325, lng: 78.1356, address: 'Eco Park Road, Tallakulam, Madurai' },
        streetName: 'Eco Park Road',
        landmark: 'Opposite Tallakulam Post Office',
        fullAddress: 'Eco Park Road, Tallakulam, Madurai - 625002',
        pincode: '625002',
        severity: 'blue',
        urgencyScore: 55,
        status: 'Acknowledged',
        reportedBy: userCitizen2._id,
        upvotes: [userCitizen1._id],
        assignedDepartment: 'Madurai Corp',
        assignedOfficial: officialMc._id,
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        officialReplies: [
          { user: officialMc._id, text: 'A clean-up proposal has been approved. Public works department is preparing a quotation to repair the play structures and filter the pond. We will begin work shortly.' }
        ]
      },
      {
        title: 'Cracked and Caved-in Manhole Cover on Thirunagar 3rd Street',
        description: 'A heavy concrete manhole cover located on Thirunagar 3rd street is cracked down the middle and has partially caved in. It is sitting loose and could give way at any moment under a heavy vehicle. Since there is no warning barrier or streetlight nearby, it is a deadly trap for night drivers.',
        category: 'Sewerage',
        wardNumber: '30', // using available ward
        location: { lat: 9.8821, lng: 78.0754, address: '3rd Street, Thirunagar, Madurai' },
        streetName: '3rd Street',
        landmark: 'Near Thirunagar Bus Stop',
        fullAddress: '3rd Street, Thirunagar, Madurai - 625006',
        pincode: '625006',
        severity: 'red',
        urgencyScore: 87,
        status: 'Acknowledged',
        reportedBy: userCitizen3._id,
        upvotes: [userCitizen1._id, userCitizen2._id],
        assignedDepartment: 'Madurai Corp',
        assignedOfficial: officialMc._id,
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        officialReplies: [
          { user: officialMc._id, text: 'We have placed temporary warning cones around the manhole cover. A replacement precast concrete cover has been ordered and will be fitted tomorrow morning.' }
        ]
      },
      {
        title: 'Huge Underground Water Pipe Leakage at Koodal Nagar Crossing',
        description: 'There is a major pipe burst near Koodal Nagar railway crossing. Clean drinking water is gushing out on the road like a fountain, wasting thousands of gallons of water. Due to this burst, water pressure has dropped drastically in over 200 nearby houses.',
        category: 'Water Supply',
        wardNumber: '2',
        location: { lat: 9.9515, lng: 78.0945, address: 'Railway Crossing Road, Koodal Nagar, Madurai' },
        streetName: 'Railway Crossing Road',
        landmark: 'Koodal Nagar Railway Crossing',
        fullAddress: 'Koodal Nagar Crossing, Koodal Nagar, Madurai - 625018',
        pincode: '625018',
        severity: 'yellow',
        urgencyScore: 79,
        status: 'Reported',
        reportedBy: userCitizen2._id,
        upvotes: [userCitizen3._id, userCitizen1._id],
        comments: [
          { user: userCitizen1._id, text: 'So much pure drinking water is being wasted on the road while we get dry taps. Please shut the supply valve and patch it.' }
        ]
      },
      {
        title: 'Overflowing Sewage Canal at Thathaneri Crematorium Road',
        description: 'A sub-drainage channel near Thathaneri Crematorium has choked completely with plastic garbage. Sewage is spilling onto the road, creating an unhygienic marshland and causing terrible odor for residents and visitors to the crematorium. Mosquitoes are swarming the area.',
        category: 'Sewerage',
        wardNumber: '15',
        location: { lat: 9.9360, lng: 78.1105, address: 'Crematorium Road, Thathaneri, Madurai' },
        streetName: 'Crematorium Road',
        landmark: 'Near Thathaneri Crematorium entrance',
        fullAddress: 'Crematorium Road, Thathaneri, Madurai - 625018',
        pincode: '625018',
        severity: 'red',
        urgencyScore: 84,
        status: 'In Progress',
        reportedBy: userCitizen1._id,
        upvotes: [userCitizen2._id],
        assignedDepartment: 'Health',
        assignedOfficial: officialHealth._id,
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        officialReplies: [
          { user: officialHealth._id, text: 'Sanitation workers are currently de-silting the channel. Bleaching powder is being sprayed on the banks to control the flies and bacterial growth.' }
        ]
      },
      {
        title: 'Flickering Streetlight on KK Nagar 4th East Cross Street',
        description: 'A streetlight right in front of the children park is continuously flickering, creating a strobe-like effect. It goes completely dead after a few minutes, making the corner dark and encouraging anti-social elements to gather.',
        category: 'Street Light',
        wardNumber: '15',
        location: { lat: 9.9280, lng: 78.1432, address: 'KK Nagar 4th East Cross Street, Madurai' },
        streetName: '4th East Cross Street',
        landmark: 'In front of KK Nagar Park',
        fullAddress: '4th East Cross Street, KK Nagar, Madurai - 625020',
        pincode: '625020',
        severity: 'blue',
        urgencyScore: 48,
        status: 'Resolved',
        reportedBy: userCitizen3._id,
        upvotes: [],
        assignedDepartment: 'EB',
        assignedOfficial: officialEb._id,
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        officialReplies: [
          { user: officialEb._id, text: 'The bulb choke/starter was faulty. We have replaced the fluorescent fixture with a new LED tube panel. The light is now steady.' }
        ]
      }
    ];

    // Map issues to real wards
    console.log('Mapping issues to matching ward/zone records...');
    const mappedIssues = issuesData.map((issue) => {
      const { wardNumber, zoneNumber } = getWardInfo(issue.wardNumber);
      return {
        ...issue,
        wardNumber,
        zoneNumber
      };
    });

    console.log('Inserting issues...');
    await Issue.insertMany(mappedIssues);
    console.log(`Seeded ${mappedIssues.length} issues successfully.`);

    console.log('Database seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDB();
