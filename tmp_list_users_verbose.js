
const admin = require('firebase-admin');
const projectId = 'firestoredb-6d462';
const clientEmail = 'firebase-adminsdk-tvqr4@firestoredb-6d462.iam.gserviceaccount.com';
const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD0g4dOUMh/P9Af\nMSxlG2h3nm4wpsLCNr1TpBujDu60/oiapL4fo3iBXuqD0vzUP0trzg9WsQyvSnYR\n2u43ZPf0MkevclbvCci3BmR0e7dP0D0VpA1CVQho2vXwalVj0+EN8g/P1ILbLAj4\nyKf+LKs78WLB+CKcVLbTvkDDiKhzfH9eio0Oi6COHlY3xIueEoS2Q1dslkdc/IQq\nFWNIE90IVACgsjLybHquW97uB/jHKvLPBMsnoLHnhUbyxIxyh8kY5lmxVHeBzgfj\nPQdrE/Dtv0uz1b+uIWzZyEs7cblJagEHjWV/H0/7qW9H5eaO4WFlRjG3TxrNor/Y\npF4ZVGlDAgMBAAECggEAXSlIAlTRL3qWx2uq6JL6yKi6fxrqlajZleavCP+Ff7yD\nO7iNH+ze2xvY6oUXA59iEx8dxQAMPzV1qvPpU33K42XM3lIIQWdO7D0pRSBmBajn\nvTkWPDG91IWoswMwqapu0ytpTtw/R1aNzIxXRYarb1lXMWRje4Djb+XLMzT8SZNl\Ghk2UDPncfWSJtSbc+pEcDYP5nsBnYf/T7KcYPrfyIP2mE7RAsBb3Mqr1lEueob+\nMR8nT2FHybiRnh1cSVNXEz7Cv8PgVjor0jgHMi+/xIl+KgHLzAUBaAgDBcuuUiK4\n20dAr/pXbSECE8S7d5G+YU2dDE6bDP/oF4bYkISVgQKBgQD/m9kaQBMOxfju2bvs\nS9zU4F8PcylXa4w25FMZ85ywd2AgqyP06L32Rk3FWSKVfoYWcztEIPWW4kAnP2gp\VgLhdGQLuapjt6ibzPj6M28wkQeSB+o4noqJAyvZgKcd1+r87YEf+AkVF8ajnYEi\nvSEb+gZ733HPWJ9swOAq9gc/4QKBgQD041VRKhqUeCWwkIybiv1l6VhwR+MqdS9L\nKeTbPrKBr+WNHikpX6S679oDBDSBxu/w9ulI3wGkvWCQ1olpQXjn0jcnvdCAe8W6\nCp7p3X7hP6ZUhwhb68z3bhrn5lDEhBVIuwyJ217ni1zzG8aZqKW9HTVaFf83SNtU\nVDRRaMJdowKBgFxKek4XGop4AtTC+y5ridW3GburWh79bwgW0saJBmdVAvlosbfp\nHUXBxqzd7TXLFEEg5CJKQEJ1eLJzG3npW2rqKoFtTU9p7dArZy53ycrgYrpgbzp4\nTA8CfR+waybEYk1mt/vCBA2AozFKWmkfnsfKM/MgD6jNF+sdjRMV+DIhAoGBAMSY\ngNTRDVemAPP3h7oTYgzfwS0auSdLvnUEJANTGTF+CbY5wWfCrdeZWJdVV+Xb1KLJ\nRk1HIuWjVxPP9661biAFplvUSb/sHbeWcS9kr0ibtadkZHSPIBR/o0AKqUqqkv+5\nkn5Vy6HtQui0osKXHr9s5Hj28dXrOpE/rGSyyl8rAoGBAOxmCmTkgI3MBYYAC86B\nvSVwY5TdPoSgJFVyblsQQIIAehBjlh3JbZklrlL/u/VsTnTze66fdjDSpIVjAxgf\nh2uoRgXpB4COQmLElhFg2vbCFx2sOwZTJIWvj5wGFWqNk7jITwCyTU9jwFBSVnyq\nJPZ6I7xVJXq6DhMLl5Sy4rg2\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = admin.firestore();

async function listUsersVerbose() {
  const snapshot = await db.collection('users').get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`--- User: ${doc.id} ---`);
    console.log(`Name: ${data.displayName}`);
    console.log(`XP: ${data.totalXP}`);
    console.log(`Gems: ${data.gems}`);
    console.log(`Streak: ${data.streak}`);
    console.log(`Recent Activity: ${data.recentActivity ? data.recentActivity.toDate().toLocaleString() : 'N/A'}`);
  });
}

listUsersVerbose().catch(console.error);
