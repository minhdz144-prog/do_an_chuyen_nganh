// Script sửa lỗi dữ liệu: migrate trường 'skills' cũ sang 'requiredSkills' chuẩn
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://minhdz144:20100856@cluster0.vh6u4xm.mongodb.net/it-job-portal?appName=Cluster0';

async function fixSkillsField() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const Job = mongoose.connection.db.collection('jobs');

  // Tìm tất cả job có trường 'skills' nhưng không có 'requiredSkills'
  const jobsToFix = await Job.find({
    skills: { $exists: true, $ne: [] },
    $or: [
      { requiredSkills: { $exists: false } },
      { requiredSkills: { $size: 0 } },
      { requiredSkills: null }
    ]
  }).toArray();

  console.log(`Found ${jobsToFix.length} jobs to fix:`);
  jobsToFix.forEach(j => {
    console.log(`  - ${j.title}: skills=${JSON.stringify(j.skills)}`);
  });

  if (jobsToFix.length > 0) {
    // Copy 'skills' vào 'requiredSkills' cho từng job
    for (const job of jobsToFix) {
      await Job.updateOne(
        { _id: job._id },
        { $set: { requiredSkills: job.skills } }
      );
    }
    console.log(`\n✅ Fixed ${jobsToFix.length} jobs! 'skills' -> 'requiredSkills'`);
  }

  // Xác nhận kết quả
  console.log('\n--- Verification ---');
  const allJobs = await Job.find({}).toArray();
  allJobs.forEach(j => {
    console.log(`${j._id} | ${j.title} | requiredSkills: ${JSON.stringify(j.requiredSkills)}`);
  });

  process.exit(0);
}

fixSkillsField().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
