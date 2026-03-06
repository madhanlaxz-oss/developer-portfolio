
// Add event listener to the navbar links
document.querySelectorAll('.navbar a').forEach(link => {
  link.addEventListener('click', () => {
    // Remove active class from all links
    document.querySelectorAll('.navbar a').forEach(link => link.classList.remove('active'));
    // Add active class to the clicked link
    link.classList.add('active');
  });
});

// Add animation to the home section
const homeSection = document.querySelector('.home');
homeSection.classList.add('animate');

// Add animation to the header
const header = document.querySelector('header');
header.classList.add('animate');


// Add event listener to the download CV button
document.querySelector('.btn').addEventListener('click', () => {
  alert('Your CV is being downloaded!');
});

// Add event listener to the social media icons
document.querySelectorAll('.social-icons a').forEach(icon => {
  icon.addEventListener('click', () => {
    alert(`You are being redirected to ${icon.href}!`);
  });
});

// Add animation to the home section
homeSection.addEventListener('mouseover', () => {
  homeSection.style.transform = 'scale(1.1)';
});

homeSection.addEventListener('mouseout', () => {
  homeSection.style.transform = 'scale(1)';
});
