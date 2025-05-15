
interface PostContentProps {
  content: string;
  mediaUrl?: string | null;
}

const PostContent = ({ content, mediaUrl }: PostContentProps) => {
  return (
    <div className="p-4 pt-0">
      <p className="text-sm md:text-base whitespace-pre-wrap mb-3">{content}</p>
      
      {mediaUrl && (
        <div className="rounded-md overflow-hidden my-2">
          {mediaUrl.includes('.mp4') ? (
            <video 
              src={mediaUrl} 
              controls 
              className="w-full h-auto max-h-[500px] object-contain"
            />
          ) : (
            <img 
              src={mediaUrl} 
              alt="Post media" 
              className="w-full h-auto max-h-[500px] object-contain"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PostContent;
