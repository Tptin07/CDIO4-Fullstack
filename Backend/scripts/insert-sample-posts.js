import { query } from '../config/database.js';

/**
 * Script để thêm 3 bài viết mẫu vào database
 */

async function insertSamplePosts() {
  try {
    console.log('🚀 Bắt đầu thêm 3 bài viết mẫu vào database...\n');

    // Kiểm tra xem các slug đã tồn tại chưa
    const existingPosts = await query(
      'SELECT slug FROM posts WHERE slug IN (?, ?, ?)',
      [
        'probiotic-va-suc-khoe-tieu-hoa',
        'cham-soc-suc-khoe-tre-em-mua-dong',
        'vitamin-d-va-xuong-khop'
      ]
    );

    if (existingPosts.length > 0) {
      console.log('⚠️  Một số bài viết đã tồn tại. Đang xóa các bài viết cũ...');
      for (const post of existingPosts) {
        await query('DELETE FROM posts WHERE slug = ?', [post.slug]);
      }
    }

    // 3 bài viết mẫu mới
    const samplePosts = [
      {
        title: 'Probiotic và sức khỏe tiêu hóa: Những điều cần biết',
        slug: 'probiotic-va-suc-khoe-tieu-hoa',
        excerpt: 'Probiotic là những vi khuẩn có lợi giúp cân bằng hệ vi sinh đường ruột, cải thiện tiêu hóa và tăng cường sức đề kháng. Tìm hiểu cách sử dụng probiotic hiệu quả.',
        content: `<p>Probiotic là những vi khuẩn sống có lợi cho sức khỏe, đặc biệt là hệ tiêu hóa. Khi được bổ sung với số lượng phù hợp, chúng có thể mang lại nhiều lợi ích cho cơ thể.</p>
        
        <h2>Probiotic là gì?</h2>
        <p>Probiotic là các vi sinh vật sống, chủ yếu là vi khuẩn và nấm men, có lợi cho sức khỏe khi được tiêu thụ đúng cách. Chúng thường được tìm thấy trong các sản phẩm lên men như sữa chua, kefir, kim chi, và các thực phẩm chức năng.</p>
        
        <h2>Lợi ích của Probiotic</h2>
        <ul>
          <li><strong>Cải thiện tiêu hóa:</strong> Probiotic giúp cân bằng hệ vi sinh đường ruột, giảm các vấn đề như đầy hơi, táo bón, tiêu chảy.</li>
          <li><strong>Tăng cường miễn dịch:</strong> Hệ vi sinh đường ruột khỏe mạnh có thể tăng cường hệ thống miễn dịch của cơ thể.</li>
          <li><strong>Hỗ trợ hấp thu dinh dưỡng:</strong> Probiotic giúp cơ thể hấp thu các chất dinh dưỡng tốt hơn.</li>
          <li><strong>Giảm viêm:</strong> Một số chủng probiotic có thể giúp giảm viêm trong cơ thể.</li>
        </ul>
        
        <h2>Cách sử dụng Probiotic hiệu quả</h2>
        <p>Để đạt được hiệu quả tối đa, bạn nên:</p>
        <ol>
          <li>Chọn sản phẩm có nhiều chủng vi khuẩn khác nhau (đa chủng)</li>
          <li>Đảm bảo sản phẩm có số lượng CFU (Colony Forming Units) đủ cao (thường từ 1-10 tỷ CFU)</li>
          <li>Uống vào buổi sáng khi bụng đói hoặc trước bữa ăn</li>
          <li>Sử dụng đều đặn hàng ngày để duy trì hiệu quả</li>
          <li>Bảo quản đúng cách theo hướng dẫn của nhà sản xuất</li>
        </ol>
        
        <h2>Lưu ý khi sử dụng</h2>
        <p>Mặc dù probiotic thường an toàn, nhưng một số người có thể gặp tác dụng phụ nhẹ như đầy hơi hoặc khó chịu dạ dày trong những ngày đầu. Nếu bạn có hệ miễn dịch suy yếu hoặc đang điều trị bệnh nghiêm trọng, hãy tham khảo ý kiến bác sĩ trước khi sử dụng.</p>
        
        <p>Probiotic là một phần quan trọng của chế độ ăn uống lành mạnh. Kết hợp với chế độ ăn giàu chất xơ và lối sống lành mạnh, probiotic có thể giúp bạn duy trì một hệ tiêu hóa khỏe mạnh.</p>`,
        cover_image: '/blog/probiotic.png',
        category: 'Sức khỏe',
        author: 'BS. Nguyễn Thị Hương',
        tags: JSON.stringify(['probiotic', 'tiêu hóa', 'sức khỏe', 'dinh dưỡng']),
        read_minutes: 8,
        view_count: 0,
        status: 'published',
        published_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        title: 'Chăm sóc sức khỏe trẻ em mùa đông: Bí quyết phòng bệnh hiệu quả',
        slug: 'cham-soc-suc-khoe-tre-em-mua-dong',
        excerpt: 'Mùa đông là thời điểm trẻ em dễ mắc các bệnh về đường hô hấp. Hãy cùng tìm hiểu các cách phòng bệnh và chăm sóc sức khỏe cho trẻ trong mùa lạnh.',
        content: `<p>Mùa đông với thời tiết lạnh và khô là thời điểm trẻ em dễ mắc các bệnh về đường hô hấp như cảm lạnh, cúm, viêm phế quản. Việc chăm sóc sức khỏe cho trẻ đúng cách sẽ giúp phòng ngừa bệnh tật hiệu quả.</p>
        
        <h2>Giữ ấm cơ thể</h2>
        <p>Việc giữ ấm cho trẻ là ưu tiên hàng đầu trong mùa đông:</p>
        <ul>
          <li>Mặc quần áo đủ ấm, đặc biệt là vùng cổ, ngực và bàn chân</li>
          <li>Đội mũ và đeo khăn quàng cổ khi ra ngoài</li>
          <li>Giữ nhiệt độ phòng ở mức ổn định (khoảng 22-24°C)</li>
          <li>Tránh thay đổi nhiệt độ đột ngột</li>
        </ul>
        
        <h2>Chế độ dinh dưỡng hợp lý</h2>
        <p>Dinh dưỡng đóng vai trò quan trọng trong việc tăng cường sức đề kháng:</p>
        <ul>
          <li><strong>Bổ sung vitamin C:</strong> Có trong cam, quýt, ổi, kiwi giúp tăng cường miễn dịch</li>
          <li><strong>Vitamin D:</strong> Quan trọng cho hệ miễn dịch và xương, có thể bổ sung qua thực phẩm hoặc ánh nắng mặt trời</li>
          <li><strong>Kẽm:</strong> Có trong thịt, cá, trứng giúp tăng cường sức đề kháng</li>
          <li><strong>Uống đủ nước:</strong> Giữ ẩm cho cơ thể và đường hô hấp</li>
        </ul>
        
        <h2>Vệ sinh cá nhân</h2>
        <p>Vệ sinh đúng cách giúp ngăn ngừa sự lây lan của vi khuẩn và virus:</p>
        <ol>
          <li>Rửa tay thường xuyên bằng xà phòng hoặc nước rửa tay</li>
          <li>Dạy trẻ che miệng khi ho hoặc hắt hơi</li>
          <li>Vệ sinh mũi họng bằng nước muối sinh lý</li>
          <li>Giữ không gian sống sạch sẽ, thông thoáng</li>
        </ol>
        
        <h2>Tiêm phòng đầy đủ</h2>
        <p>Đảm bảo trẻ được tiêm phòng đầy đủ theo lịch, đặc biệt là vaccine cúm mùa. Vaccine cúm nên được tiêm hàng năm trước mùa đông để đạt hiệu quả tốt nhất.</p>
        
        <h2>Khi nào cần đưa trẻ đến bác sĩ?</h2>
        <p>Hãy đưa trẻ đến cơ sở y tế nếu trẻ có các dấu hiệu:</p>
        <ul>
          <li>Sốt cao trên 38.5°C kéo dài</li>
          <li>Ho nhiều, khó thở</li>
          <li>Bỏ ăn, bỏ bú</li>
          <li>Mệt mỏi, quấy khóc bất thường</li>
          <li>Có dấu hiệu mất nước</li>
        </ul>
        
        <p>Chăm sóc sức khỏe trẻ em mùa đông đòi hỏi sự chú ý và kiên nhẫn. Với những biện pháp phòng ngừa đúng cách, bạn có thể giúp trẻ vượt qua mùa đông một cách khỏe mạnh.</p>`,
        cover_image: '/blog/news-flu.jpg',
        category: 'Sức khỏe',
        author: 'BS. Trần Văn Minh',
        tags: JSON.stringify(['trẻ em', 'mùa đông', 'phòng bệnh', 'sức khỏe']),
        read_minutes: 10,
        view_count: 0,
        status: 'published',
        published_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        title: 'Vitamin D và sức khỏe xương khớp: Tầm quan trọng không thể bỏ qua',
        slug: 'vitamin-d-va-xuong-khop',
        excerpt: 'Vitamin D đóng vai trò quan trọng trong việc hấp thu canxi và duy trì sức khỏe xương khớp. Tìm hiểu về nguồn cung cấp và cách bổ sung vitamin D đúng cách.',
        content: `<p>Vitamin D là một vitamin tan trong chất béo, đóng vai trò quan trọng trong nhiều chức năng của cơ thể, đặc biệt là sức khỏe xương khớp. Thiếu hụt vitamin D có thể dẫn đến nhiều vấn đề sức khỏe nghiêm trọng.</p>
        
        <h2>Vai trò của Vitamin D</h2>
        <p>Vitamin D có nhiều chức năng quan trọng:</p>
        <ul>
          <li><strong>Hấp thu canxi:</strong> Vitamin D giúp cơ thể hấp thu canxi từ thức ăn, cần thiết cho sự phát triển và duy trì xương chắc khỏe</li>
          <li><strong>Duy trì mật độ xương:</strong> Giúp ngăn ngừa loãng xương và gãy xương</li>
          <li><strong>Hỗ trợ hệ miễn dịch:</strong> Vitamin D có vai trò trong việc điều hòa hệ miễn dịch</li>
          <li><strong>Sức khỏe cơ bắp:</strong> Giúp duy trì sức mạnh cơ bắp, giảm nguy cơ té ngã ở người cao tuổi</li>
        </ul>
        
        <h2>Nguồn cung cấp Vitamin D</h2>
        <h3>1. Ánh nắng mặt trời</h3>
        <p>Đây là nguồn cung cấp vitamin D tự nhiên và hiệu quả nhất. Cơ thể có thể tổng hợp vitamin D khi da tiếp xúc với ánh nắng mặt trời (tia UVB). Thời gian tắm nắng lý tưởng là 10-15 phút vào buổi sáng (trước 10h) hoặc chiều muộn (sau 16h).</p>
        
        <h3>2. Thực phẩm</h3>
        <p>Một số thực phẩm giàu vitamin D:</p>
        <ul>
          <li>Cá béo: cá hồi, cá thu, cá ngừ</li>
          <li>Lòng đỏ trứng</li>
          <li>Gan bò</li>
          <li>Sữa và các sản phẩm từ sữa được bổ sung vitamin D</li>
          <li>Nấm (đặc biệt là nấm được phơi nắng)</li>
        </ul>
        
        <h3>3. Thực phẩm chức năng</h3>
        <p>Khi không thể tiếp xúc đủ ánh nắng hoặc chế độ ăn không đủ, việc bổ sung vitamin D qua thực phẩm chức năng là cần thiết. Liều lượng khuyến nghị thường là 600-800 IU/ngày cho người trưởng thành, và 1000-2000 IU/ngày cho người cao tuổi.</p>
        
        <h2>Dấu hiệu thiếu hụt Vitamin D</h2>
        <p>Một số dấu hiệu có thể cho thấy bạn đang thiếu vitamin D:</p>
        <ul>
          <li>Mệt mỏi, yếu cơ</li>
          <li>Đau xương, đau khớp</li>
          <li>Thường xuyên bị ốm, nhiễm trùng</li>
          <li>Trầm cảm, tâm trạng thay đổi</li>
          <li>Rụng tóc</li>
          <li>Vết thương lâu lành</li>
        </ul>
        
        <h2>Lưu ý khi bổ sung Vitamin D</h2>
        <ul>
          <li>Nên kiểm tra nồng độ vitamin D trong máu trước khi bổ sung liều cao</li>
          <li>Vitamin D tan trong chất béo, nên uống cùng với bữa ăn có chất béo để hấp thu tốt hơn</li>
          <li>Không nên bổ sung quá liều vì có thể gây độc tính</li>
          <li>Tham khảo ý kiến bác sĩ về liều lượng phù hợp với tình trạng sức khỏe của bạn</li>
        </ul>
        
        <p>Vitamin D là một dưỡng chất thiết yếu cho sức khỏe xương khớp và toàn bộ cơ thể. Đảm bảo cung cấp đủ vitamin D thông qua ánh nắng, chế độ ăn và thực phẩm chức năng sẽ giúp bạn duy trì sức khỏe tốt.</p>`,
        cover_image: '/blog/vitc.png',
        category: 'Dinh dưỡng',
        author: 'ThS. Lê Thị Lan',
        tags: JSON.stringify(['vitamin D', 'xương khớp', 'dinh dưỡng', 'sức khỏe']),
        read_minutes: 9,
        view_count: 0,
        status: 'published',
        published_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
    ];

    // Insert từng bài viết
    let insertedCount = 0;
    for (const post of samplePosts) {
      try {
        const result = await query(
          `INSERT INTO posts (
            title, slug, excerpt, content, cover_image, category, 
            author, tags, read_minutes, view_count, status, published_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            post.title,
            post.slug,
            post.excerpt,
            post.content,
            post.cover_image,
            post.category,
            post.author,
            post.tags,
            post.read_minutes,
            post.view_count,
            post.status,
            post.published_at
          ]
        );

        console.log(`✅ Đã thêm bài viết: "${post.title}" (ID: ${result.insertId})`);
        insertedCount++;
      } catch (error) {
        if (error.message.includes('Duplicate entry')) {
          console.log(`⚠️  Bài viết "${post.title}" đã tồn tại, bỏ qua...`);
        } else {
          console.error(`❌ Lỗi khi thêm bài viết "${post.title}":`, error.message);
        }
      }
    }

    // Kiểm tra lại
    const totalPosts = await query('SELECT COUNT(*) as total FROM posts WHERE status = ?', ['published']);
    const totalResult = Array.isArray(totalPosts) ? totalPosts[0] : totalPosts;
    
    console.log(`\n📊 Tổng số bài viết đã published: ${totalResult?.total || 0}`);
    console.log(`✅ Đã thêm thành công ${insertedCount}/3 bài viết mẫu\n`);

    // Hiển thị danh sách bài viết vừa thêm
    const newPosts = await query(
      'SELECT id, title, slug, category, author FROM posts WHERE slug IN (?, ?, ?) ORDER BY id DESC',
      ['probiotic-va-suc-khoe-tieu-hoa', 'cham-soc-suc-khoe-tre-em-mua-dong', 'vitamin-d-va-xuong-khop']
    );

    if (newPosts.length > 0) {
      console.log('📝 Danh sách bài viết vừa thêm:');
      newPosts.forEach((post, index) => {
        console.log(`   ${index + 1}. [ID: ${post.id}] ${post.title}`);
        console.log(`      - Category: ${post.category}`);
        console.log(`      - Author: ${post.author}`);
        console.log(`      - Slug: ${post.slug}\n`);
      });
    }

    console.log('✅ Hoàn tất! 3 bài viết mẫu đã được thêm vào database.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    console.error('❌ Stack:', error.stack);
    process.exit(1);
  }
}

insertSamplePosts();

